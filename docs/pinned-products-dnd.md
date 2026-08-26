# Pinned Products - Drag & Drop và sắp xếp vị trí

Tài liệu này giải thích toàn bộ cơ chế kéo–thả (DnD) và sắp xếp thứ tự của
**pinned products** trong tenant `hoa-theo-mua`: mỗi file/hàm làm **gì**, **tại
sao** phải làm như vậy, và **khi nào** được gọi.

Đối tượng đọc: người maintain sau này cần sửa bug hoặc thêm tính năng cho trang
`pinned-products.page.tsx` mà không phá vỡ các invariant tinh tế bên dưới.

---

## Mục lục

- [Bối cảnh nghiệp vụ](#bối-cảnh-nghiệp-vụ)
- [Bản đồ file](#bản-đồ-file)
- [Mô hình position - vì sao dùng sparse integer](#mô-hình-position--vì-sao-dùng-sparse-integer)
- [Kiến trúc theo tầng](#kiến-trúc-theo-tầng)
- [Tầng 1 - `reorder-utils.ts` (thuần tính toán)](#tầng-1--reorder-utilsts-thuần-tính-toán)
- [Tầng 2 - Hooks mutation](#tầng-2--hooks-mutation)
- [Tầng 3 - `use-pinned-board.ts` (điều phối)](#tầng-3--use-pinned-boardts-điều-phối)
- [Tầng 4 - UI](#tầng-4--ui)
- [Luồng chạy đầy đủ](#luồng-chạy-đầy-đủ)
- [Những quyết định dễ bị "sửa nhầm"](#những-quyết-định-dễ-bị-sửa-nhầm)
- [Troubleshooting](#troubleshooting)
- [Checklist khi sửa/thêm tính năng](#checklist-khi-sửathêm-tính-năng)

---

## Bối cảnh nghiệp vụ

**Pinned product** = sản phẩm được ghim để hiển thị nổi bật ở storefront. Có
**hai loại scope** (phạm vi), phân biệt bằng `categoryId`:

| Scope        | `categoryId` | Ý nghĩa                                                           | Nơi backend lưu `position`        |
| ------------ | ------------ | ----------------------------------------------------------------- | --------------------------------- |
| **Global**   | `undefined`  | Danh sách ghim ở trang chủ (cấp Product)                          | Cột `position` trên bảng product  |
| **Category** | có giá trị   | Danh sách ghim trong 1 category (cấp junction product ↔ category) | Cột `position` trên bảng junction |

> **Quan trọng:** một product có thể được ghim ở nhiều scope cùng lúc, và ở mỗi
> scope nó có một `position` **độc lập**. Vì vậy mọi query key, mutation key,
> mutation scope đều phải nhét `categoryId` vào - hai scope không bao giờ được
> dùng chung cache entry.

Người dùng cần làm được:

1. Kéo–thả để đổi thứ tự (chuột, cảm ứng, bàn phím).
2. Đổi vị trí không cần kéo (menu ⋮ → lên/xuống/đầu/cuối/nhảy tới số N).
3. Bỏ ghim (unpin) và **hoàn tác** được trong 8 giây, khôi phục đúng vị trí cũ.
4. Ghim hàng loạt từ sheet "Thêm sản phẩm".
5. Tìm kiếm trong danh sách đã ghim.

---

## Bản đồ file

```
src/tenants/hoa-theo-mua/
├── pages/
│   └── pinned-products.page.tsx          # Layout + DndContext, không đụng cache
└── features/products/
    ├── reorder-utils.ts                  # ★ Toán thuần: tính position mới
    ├── query-keys.ts                     # Key cho query / mutation / scope
    ├── services.ts                       # moveProduct, pinProduct, getPinnedProducts
    ├── category-membership.ts            # Đảm bảo product thuộc category trước khi ghim
    ├── hooks/
    │   ├── use-pinned-board.ts           # ★ Điều phối: đọc + mutate 1 scope
    │   ├── use-get-pinned-products.ts    # Query + sort theo position
    │   ├── use-reorder-pinned-products.ts# Persist plan reorder
    │   ├── use-unpin-pinned-product.ts   # Unpin + undo (restore vị trí)
    │   ├── use-bulk-pin-products.ts      # Ghim hàng loạt (append cuối)
    │   └── use-update-product-pins.ts    # Ghim/bỏ ghim 1 product qua nhiều scope
    └── components/
        ├── sortable-pinned-product-card.tsx # Wrapper useSortable
        ├── pinned-product-card.tsx          # Card thuần (dùng cả cho DragOverlay)
        ├── pinned-product-actions-menu.tsx  # Menu ⋮
        ├── move-to-position-popover.tsx     # Nhảy tới vị trí số N
        ├── pinned-fold-divider.tsx          # Vạch "storefront cắt ở đây"
        ├── pinned-board-toolbar.tsx         # Filter category / search / view
        └── add-pinned-products-sheet.tsx    # Chọn sản phẩm để ghim hàng loạt
```

`★` = hai file cần đọc kỹ nhất.

---

## Mô hình position - vì sao dùng sparse integer

```ts
// src/shared/constants.ts
export const INITIAL_POSITION = 140737488355328 // 2^47
export const POSITION_GAP = 16384 // 2^14
```

### Vấn đề

Nếu `position` là index liên tiếp (`0, 1, 2, 3…`), mỗi lần kéo 1 thẻ từ vị trí
10 lên vị trí 2 sẽ phải **update lại 9 dòng** trong DB. Danh sách 50 sản phẩm →
một cú kéo có thể sinh hàng chục request PUT.

### Giải pháp - sparse integer + midpoint

Position được đánh **thưa** (cách nhau `POSITION_GAP = 16384`), nên khi chèn một
item vào giữa hai hàng xóm, ta chỉ cần lấy **điểm giữa**:

```
Trước:   A=16384      B=32768      C=49152
Kéo C vào giữa A và B:
         position mới của C = floor((16384 + 32768) / 2) = 24576
Sau:     A=16384      C=24576      B=32768
```

→ **Chỉ 1 request PUT** cho toàn bộ thao tác kéo, thay vì N request.

### Khi nào hết chỗ?

Mỗi lần chèn giữa, khoảng cách giảm một nửa. Với `GAP = 16384`, ta chèn được
khoảng **14 lần liên tiếp vào cùng một khe** trước khi hai hàng xóm chỉ còn cách
nhau 1 đơn vị - lúc đó không còn integer nào nằm giữa. Đây là ý nghĩa của:

```ts
const MIN_GAP = 2 // reorder-utils.ts
```

Khi `next - previous < MIN_GAP` → không tính được midpoint → **fallback sang
`renumber()`**, đánh lại position đều nhau cho cả danh sách. Lần renumber này
"sửa vĩnh viễn" scope đó và tái tạo khoảng trống cho hàng nghìn thao tác tiếp
theo.

### Dữ liệu server có thể "bẩn"

`position` là `number | null` và server có thể trả về nhiều dòng cùng
`INITIAL_POSITION` (mặc định khi mới ghim). Vì vậy:

- `use-get-pinned-products.ts` **luôn sort lại theo `position` khi đọc**, không
  tin thứ tự mảng API trả về. `Array.prototype.sort` là stable nên các dòng
  trùng position giữ nguyên thứ tự server, và `null` được đẩy xuống cuối
  (`?? Number.POSITIVE_INFINITY`) thay vì nhảy lên đầu.
- Mọi hàm tính toán đều gọi `isNormalized()` trước, gặp dữ liệu bẩn thì
  `renumber()` toàn bộ.

---

## Kiến trúc theo tầng

```
┌─────────────────────────────────────────────────────────────┐
│ pinned-products.page.tsx                                    │
│ Chỉ layout: DndContext, SortableContext, render card.       │
│ KHÔNG đụng queryClient, KHÔNG tự tính position.             │
└────────────────────────┬────────────────────────────────────┘
                         │ board.onDragEnd / board.moveToIndex / board.unpin
┌────────────────────────▼────────────────────────────────────┐
│ use-pinned-board.ts  - điều phối 1 scope                    │
│ • đọc list, lọc search, tính pendingIds, activeProduct      │
│ • commitPlan(): ghi cache ĐỒNG BỘ rồi mới gọi mutation      │
└────────────────────────┬────────────────────────────────────┘
        ┌────────────────┴─────────────────┐
┌───────▼──────────┐              ┌────────▼─────────────────┐
│ reorder-utils.ts │              │ use-*-pinned-*.ts hooks  │
│ Hàm thuần, không │              │ Gọi API, rollback, toast,│
│ React, không I/O │              │ invalidate               │
└──────────────────┘              └──────────────────────────┘
```

**Nguyên tắc:** phần _tính toán_ (position nào, item nào cần update) hoàn toàn
tách khỏi phần _thực thi_ (gọi API, ghi cache). Nhờ vậy `reorder-utils.ts` đọc
được như một thư viện thuần và test/debug được bằng mắt.

---

## Tầng 1 - `reorder-utils.ts` (thuần tính toán)

Không import React, không gọi API. Đầu vào là mảng, đầu ra là **plan**.

### Kiểu `PinnedReorderPlan`

```ts
interface PinnedReorderPlan {
  items: PinnedProduct[] // danh sách mới → ghi vào cache (optimistic)
  updates: { id; position }[] // những item THỰC SỰ cần gọi API
  isRenumber: boolean // có phải đánh lại toàn bộ không
}
```

Tách `items` và `updates` là điểm mấu chốt: `items` cho UI (thay đổi thứ tự
hiển thị), `updates` cho network (tối thiểu số request). Trong trường hợp thường
gặp, `items` có 50 phần tử nhưng `updates` chỉ có **1**.

> **Lưu ý:** `isRenumber` hiện **không có consumer nào** trong code - nó là cờ
> chẩn đoán, để khi debug (hoặc log) biết được một plan là "sửa 1 item" hay "đánh
> lại cả scope". Đừng xoá vội, nhưng cũng đừng tưởng có logic nào đang đọc nó.

### `isNormalized(items): boolean`

- **Gì:** trả `true` nếu mọi `position` đều tồn tại, là số hữu hạn, và **tăng dần
  nghiêm ngặt** theo đúng thứ tự phần tử trong mảng.
- **Khi nào:** cửa ngõ đầu tiên của `planMove`, `planInsert`, và của
  `useBulkPinProducts` trước khi append. Đây là hàm quyết định "đi đường nhanh
  (1 request)" hay "đi đường sửa chữa (`renumber`, N request)".

```ts
export function isNormalized(items: PinnedProduct[]): boolean {
  let previous = Number.NEGATIVE_INFINITY

  for (const item of items) {
    const position = item.position

    if (position == null || !Number.isFinite(position) || position <= previous) {
      return false
    }

    previous = position
  }

  return true
}
```

#### Ba điều kiện, ba loại dữ liệu bẩn khác nhau

| Điều kiện               | Bắt loại dữ liệu nào                    | Nếu lọt lưới thì sao                                   |
| ----------------------- | --------------------------------------- | ------------------------------------------------------ |
| `position == null`      | Hàng mới ghim, server chưa gán position | `null` tham gia phép toán → position mới sai hoàn toàn |
| `!Number.isFinite(...)` | `NaN`, `Infinity` do dữ liệu lỗi        | Mọi phép tính sau đó lan ra `NaN` → hỏng cả scope      |
| `position <= previous`  | Trùng position, hoặc mảng chưa sắp xếp  | Midpoint tính ra vô nghĩa - xem ví dụ ngay dưới        |

#### Vì sao là `<=` chứ không phải `<`

Dấu `=` mới là phần quan trọng. Server hay trả **nhiều dòng cùng
`INITIAL_POSITION`** (đó là giá trị mặc định khi mới ghim). Nếu chỉ chặn "giảm
dần" mà cho phép "bằng nhau", midpoint sẽ trả về chính con số đó:

```
A=140737488355328   B=140737488355328      ← hai dòng trùng, mảng vẫn "không giảm"
Chèn X vào giữa:  floor((140737488355328 + 140737488355328) / 2)
                = 140737488355328          ← X trùng luôn cả hai!

Kết quả: ba dòng cùng position → sort không xác định được thứ tự
       → mỗi lần refetch bảng lại xếp một kiểu ("thứ tự nhảy loạn")
```

Với `<=`, trường hợp này bị bắt ngay và `renumber()` dọn sạch một lần.

#### Hàm này kiểm tra **thứ tự mảng**, không phải "tập position có hợp lệ"

`isNormalized` đọc mảng theo đúng thứ tự nó được truyền vào. Cùng một tập dữ
liệu, thứ tự khác nhau cho kết quả khác nhau:

```
[A=100, B=200, C=300]  → true
[C=300, A=100, B=200]  → false   (cùng dữ liệu, chỉ khác thứ tự mảng)
```

Đây chính là lý do `planMove` phải lọc bỏ item vừa move ra trước khi gọi hàm này
(xem [`planMove`](#planmoveitems-fromindex-toindex-pinnedreorderplan--null)), và
lý do `useBulkPinProducts` dùng `fetchQuery` phải cẩn thận với thứ tự thô của API.

---

### `renumber(items): PinnedReorderPlan`

- **Gì:** đánh lại position cho **toàn bộ** danh sách theo khoảng cách đều nhau,
  giữ nguyên thứ tự hiển thị hiện tại.
- **Khi nào:** không bao giờ được gọi trực tiếp từ UI. Nó là **fallback** của
  `planMove` / `planInsert`, hoặc bước dọn dẹp chủ động của `useBulkPinProducts`.
- **Vai trò:** đây là "van xả" duy nhất của cả hệ thống. Mọi hàm khác đều được
  phép giả định dữ liệu sạch, vì nếu bẩn thì đã có `renumber` gánh.

```ts
export function renumber(items: PinnedProduct[]): PinnedReorderPlan {
  const next = items.map((item, index) => ({
    ...item,
    position: (index + 1) * POSITION_GAP
  }))

  const updates = next
    .filter((item, index) => item.position !== items[index].position)
    .map((item) => ({ id: item.productId, position: item.position }))

  return { items: next, updates, isRenumber: true }
}
```

#### Kết quả trông như thế nào

```
Vào (bẩn):   A=null    B=INITIAL   C=INITIAL   D=INITIAL
Ra (sạch):   A=16384   B=32768     C=49152     D=65536
             └── (index + 1) * POSITION_GAP, cách đều nhau

updates = [A, B, C, D]   ← cả 4 đều đổi → 4 request PUT
```

Thứ tự hiển thị **không đổi** - hàm chỉ cấp lại số, không sắp xếp lại. Nó tin
rằng thứ tự mảng đầu vào chính là thứ tự người dùng muốn (caller đã `arrayMove`
hoặc chèn xong rồi mới gọi).

#### Vì sao `updates` phải lọc, không lấy hết `next`

```ts
.filter((item, index) => item.position !== items[index].position)
```

Không phải lúc nào renumber cũng đổi hết. Ví dụ danh sách đã sạch nhưng bị gọi
renumber vì cạn khoảng trống ở **một** khe:

```
Vào:   A=16384   B=32768   C=40000
Ra:    A=16384   B=32768   C=49152
                           └── chỉ C đổi

updates = [C]   ← 1 request, không phải 3
```

Trường hợp cực đoan: danh sách đã đúng chuẩn `GAP, 2*GAP, 3*GAP…` thì `updates`
**rỗng** → mutation gọi `Promise.all([])` → không có request nào bay đi.

#### Vì sao bắt đầu từ `1 * GAP` chứ không phải `INITIAL_POSITION`

Sau renumber, position tụt về vùng số nhỏ (`16384, 32768…`) thay vì quanh `2^47`.
Điều này **không ảnh hưởng** gì tới đúng đắn - thứ tự chỉ phụ thuộc vào so sánh
tương đối, và việc tụt xuống thấp còn **mở rộng** khoảng trống phía trên cho các
lần append sau. Chỉ cần biết điều này khi soi DB: một scope đã từng renumber sẽ
có position nhìn rất khác một scope chưa bao giờ renumber.

#### Cái giá và cái được

|          |                                                                                                                                    |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Giá**  | N request PUT trong một lần (danh sách 50 sản phẩm → tối đa 50 request)                                                            |
| **Được** | Scope sạch **vĩnh viễn**: mọi khe đều rộng `GAP` → khoảng 13-14 lần chèn giữa liên tiếp cho **mỗi khe** trước khi cần renumber lại |

Vì vậy renumber lặp đi lặp lại là **dấu hiệu bug**, không phải hành vi bình
thường - xem [Troubleshooting](#troubleshooting).

---

### `positionBetween(items, index): number | null` _(private)_

- **Gì:** tính một position cho item đang nằm ở `index`, sao cho nó lọt đúng giữa
  hai hàng xóm.
- **Khi nào:** dùng nội bộ bởi `planMove` và `planInsert`. Không export.
- **Điều kiện tiên quyết:** caller **phải** đã xác nhận các item xung quanh là
  normalized. Hàm này không tự kiểm tra.

```ts
function positionBetween(items: PinnedProduct[], index: number): number | null {
  const previous = items[index - 1]?.position ?? null
  const next = items[index + 1]?.position ?? null

  if (previous == null && next == null) return INITIAL_POSITION // danh sách 1 item
  if (previous == null) return next! - POSITION_GAP // nằm đầu
  if (next == null) return previous + POSITION_GAP // nằm cuối
  if (next - previous < MIN_GAP) return null // hết chỗ
  return Math.floor((previous + next) / 2) // midpoint
}
```

#### Bốn tình huống, kèm số cụ thể

```
Danh sách nền:   A=16384    B=32768    C=49152

① Chèn vào GIỮA A và B
   previous=16384, next=32768
   → floor((16384 + 32768) / 2) = 24576          ✔ 1 request

② Chèn lên ĐẦU (trước A)
   previous=null, next=16384
   → 16384 - 16384 = 0                            ✔ 1 request
   (không có "hàng xóm trước" để chia đôi, nên lùi hẳn một GAP)

③ Chèn xuống CUỐI (sau C)
   previous=49152, next=null
   → 49152 + 16384 = 65536                        ✔ 1 request

④ Chèn giữa hai hàng xóm đã sát nhau
   previous=24576, next=24577
   → 24577 - 24576 = 1 < MIN_GAP(2)
   → null                                          ✘ caller phải renumber
```

#### Một chi tiết về nhánh "nằm đầu"

`next - POSITION_GAP` có thể cho ra `0` hoặc **số âm** nếu danh sách đã từng
`renumber()` (lúc đó item đầu chỉ có position `16384`) rồi bị chèn lên đầu vài
lần. Về logic thì không sao - `isNormalized` chỉ đòi số hữu hạn và tăng dần, và
sort vẫn đúng. Nhưng nếu cột `position` phía backend là kiểu unsigned thì đây là
chỗ vỡ. Chưa gặp trong thực tế (scope chưa renumber bắt đầu từ `2^47`, còn dư
hàng tỉ lần chèn đầu), ghi lại để biết đường debug.

#### Vì sao `MIN_GAP = 2` mà không phải `1`

Position là **số nguyên**. Muốn tồn tại một integer nằm **hẳn giữa** `previous`
và `next`, khoảng cách phải ít nhất là 2:

```
previous=100, next=101   → khoảng cách 1 → floor(201/2) = 100 = previous   ✘ trùng!
previous=100, next=102   → khoảng cách 2 → floor(202/2) = 101              ✔ hợp lệ
```

Nếu để `MIN_GAP = 1`, hàm sẽ trả về đúng bằng `previous` → tạo ra hai dòng trùng
position, tức là **tự sinh ra** đúng loại dữ liệu bẩn mà `isNormalized` phải đi
dọn. Đây là loại bug âm thầm: cú kéo có vẻ thành công, chỉ tới lần refetch sau
thứ tự mới nhảy.

#### Vì sao trả `null` chứ không throw

`null` ở đây **không phải lỗi** - nó là câu trả lời "đường nhanh không đi được,
mời bạn dùng đường sửa chữa". Cả hai caller đều xử lý đúng một dòng:

```ts
const position = positionBetween(reordered, toIndex)
if (position === null) return renumber(reordered)
```

Throw sẽ buộc mỗi callsite phải `try/catch` cho một tình huống hoàn toàn bình
thường và có thể xảy ra hàng ngày.

#### Trường hợp `?? null` che mất một chi tiết

`items[index - 1]?.position ?? null` gộp **hai** tình huống khác nhau thành một:
"không có hàng xóm" (index ngoài mảng) và "có hàng xóm nhưng position của nó là
`null`". Cả hai đều rơi vào nhánh "nằm đầu/nằm cuối". Điều này an toàn **chỉ vì**
caller đã chạy `isNormalized` trước - danh sách đã sạch thì không thể có
`position: null` ở giữa. Nếu ai đó bỏ bước kiểm tra ở caller, hàm này sẽ âm thầm
tính sai chứ không báo gì.

---

### `planMove(items, fromIndex, toIndex): PinnedReorderPlan | null`

- **Gì:** lập plan cho thao tác **di chuyển một item đã có sẵn** sang vị trí khác.
- **Khi nào:** `onDragEnd` (kéo–thả) và `moveToIndex` (menu ⋮: lên/xuống/đầu/
  cuối/nhảy tới số N). Cả hai đường đều đổ về đây - kéo–thả và menu chỉ khác nhau
  ở cách lấy `toIndex`.

```ts
export function planMove(items, fromIndex, toIndex): PinnedReorderPlan | null {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return null
  if (fromIndex >= items.length || toIndex >= items.length) return null

  const reordered = arrayMove(items, fromIndex, toIndex)
  const moved = reordered[toIndex]
  const resting = reordered.filter((item) => item.productId !== moved.productId)

  if (!isNormalized(resting)) return renumber(reordered)

  const position = positionBetween(reordered, toIndex)
  if (position === null) return renumber(reordered)

  return {
    items: reordered.map((item) => (item.productId === moved.productId ? { ...item, position } : item)),
    updates: [{ id: moved.productId, position }],
    isRenumber: false
  }
}
```

#### Bước 0 - các guard trả `null`

```ts
if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return null
if (fromIndex >= items.length || toIndex >= items.length) return null
```

| Guard                   | Xảy ra khi nào                                                       |
| ----------------------- | -------------------------------------------------------------------- |
| `fromIndex === toIndex` | Thả thẻ lại đúng chỗ cũ, hoặc gõ đúng số vị trí hiện tại vào popover |
| `< 0`                   | `findIndex` không tìm thấy id (thẻ vừa bị unpin ở tab khác…)         |
| `>= items.length`       | Index cũ trỏ ra ngoài danh sách đã co lại                            |

`null` = "không có gì để làm". Caller chỉ cần `if (plan) commitPlan(plan)` - không
toast, không log, không ghi cache. Đây là lý do một cú thả hụt không tốn request nào.

#### Bước 1 - `arrayMove` dựng thứ tự mới

```
items:      [A, B, C, D]      kéo A (index 0) xuống index 2
arrayMove:  [B, C, A, D]
                    └── moved = reordered[toIndex] = A
```

Lưu ý `moved` được lấy **từ mảng đã sắp xếp lại tại `toIndex`**, chứ không phải
`items[fromIndex]`. Hai cách cho cùng kết quả, nhưng cách này diễn đạt đúng ý:
"item đang nằm ở vị trí đích".

#### Bước 2 - lọc bỏ item vừa move rồi mới kiểm tra

> **Vì sao lọc bỏ?** Position **cũ** của item vừa move gần như chắc chắn phá vỡ
> tính tăng dần của mảng mới (nó vừa nhảy chỗ). Nhưng position đó sắp bị ghi đè
> nên không đáng quan tâm. Nếu kiểm tra cả nó, mọi cú kéo đều bị coi là "dữ liệu
> bẩn" và kích hoạt renumber toàn bộ - sai và cực tốn request.
>
> ```
> Ban đầu:        A=100   B=200   C=300      ← hợp lệ, tăng dần
> Kéo C lên đầu:  C=300   A=100   B=200      ← 300 > 100: "không tăng dần"!
>
> Nếu isNormalized chạy trên CẢ mảng trên  → false → renumber 3 dòng
> Lọc bỏ C ra (resting):  A=100   B=200     → true  → chỉ tính position
>                                                     mới cho C = 100-GAP
> ```
>
> Position `300` của C ở đây là **rác** - nó là vị trí cũ, sắp bị thay bằng giá
> trị từ `positionBetween()`. Chỉ các item **đứng yên** mới nói lên được dữ liệu
> có sạch hay không.

#### Bước 3 - tính position và ba lối ra

```
                        ┌─ resting bẩn ─────────→ renumber(reordered)   (N request)
planMove ──→ arrayMove ─┼─ hết chỗ giữa 2 hàng xóm → renumber(reordered) (N request)
                        └─ bình thường ─────────→ 1 update              (1 request)
```

Ở lối ra thường gặp, `items` có đủ N phần tử (để UI vẽ đúng thứ tự) nhưng
`updates` **chỉ có đúng 1 phần tử**. Đây là toàn bộ lý do tồn tại của kiến trúc
sparse position.

#### Ví dụ đầy đủ một cú kéo

```
Trước:      A=16384   B=32768   C=49152   D=65536
Kéo D lên giữa A và B  (fromIndex=3, toIndex=1)

arrayMove:  A         D         B         C
resting:    A=16384   B=32768   C=49152        → isNormalized: true ✔
positionBetween(index=1): prev=16384, next=32768
                        → floor(49152 / 2) = 24576

plan.items:   A=16384  D=24576  B=32768  C=49152
plan.updates: [{ id: D, position: 24576 }]      ← 1 request PUT duy nhất
```

---

### `planInsert(items, item, toIndex): PinnedReorderPlan`

- **Gì:** chèn một product **chưa có trong danh sách** vào vị trí `toIndex`.
- **Khi nào:** chỉ một chỗ - khôi phục sau khi bấm "Hoàn tác" ở toast unpin
  (`useUnpinPinnedProduct`). `toIndex` do `resolveRestoreIndex` cung cấp.
- **Luôn trả về plan**, không bao giờ `null`.

```ts
export function planInsert(items, item, toIndex): PinnedReorderPlan {
  const index = Math.max(0, Math.min(toIndex, items.length))
  const inserted = [...items.slice(0, index), item, ...items.slice(index)]

  if (!isNormalized(items)) return renumber(inserted) //  ← `items`, KHÔNG phải `inserted`

  const position = positionBetween(inserted, index)
  if (position === null) return renumber(inserted)

  return {
    items: inserted.map((entry) => (entry.productId === item.productId ? { ...entry, position } : entry)),
    updates: [{ id: item.productId, position }],
    isRenumber: false
  }
}
```

#### Khác `planMove` ở ba điểm

|                              | `planMove`                      | `planInsert`                          |
| ---------------------------- | ------------------------------- | ------------------------------------- |
| `item`                       | Đã nằm trong `items`            | **Chưa** nằm trong `items`            |
| Số phần tử sau xử lý         | Không đổi                       | Tăng thêm 1                           |
| Kiểm tra `isNormalized` trên | `resting` (đã lọc bỏ item move) | **`items` gốc** (mảng trước khi chèn) |
| Có thể trả `null`            | Có                              | Không                                 |

#### Vì sao `isNormalized(items)` chứ không phải `isNormalized(inserted)`

Cùng một logic với `resting` của `planMove`, chỉ khác cách đạt được. Product vừa
bị unpin mang theo `position` **cũ** (hoặc `null`), và nó sắp được cấp position
mới - nên position hiện tại của nó là rác.

```
Danh sách hiện tại:  A=16384   B=32768   C=49152
Undo unpin của X, X mang position cũ = 32768, restore vào index 1

Nếu kiểm tra `inserted`:  A=16384  X=32768  B=32768  C=49152
                                   └────────┘ trùng nhau → false → renumber 4 dòng ✘

Kiểm tra `items` gốc:     A=16384  B=32768  C=49152  → true ✔
                          → positionBetween(inserted, 1) = floor((16384+32768)/2)
                          = 24576 → 1 request
```

Nếu đảo sang `inserted`, **mọi lần undo đều renumber toàn bộ** - vẫn đúng kết
quả, nhưng biến một thao tác 1-request thành N-request, và làm position của cả
scope nhảy số vô cớ.

#### Vì sao clamp index thay vì validate

```ts
const index = Math.max(0, Math.min(toIndex, items.length))
```

Chú ý cận trên là `items.length`, **không phải** `items.length - 1` - chèn vào
cuối là hợp lệ và cần index bằng đúng độ dài mảng.

Clamp thay vì trả `null` là có chủ ý: đầu vào đến từ `resolveRestoreIndex`, chạy
trên dữ liệu đã thay đổi trong suốt 8 giây chờ undo. Một index hơi lệch **không
đáng để huỷ thao tác undo** của người dùng - đưa thẻ về gần đúng chỗ vẫn tốt hơn
nhiều so với "bấm Hoàn tác mà không có gì xảy ra".

### `resolveAppendPositions(items, count): number[]`

- **Gì:** sinh `count` position mới, tăng dần, cách nhau `POSITION_GAP`, và tất
  cả đều nằm **sau mọi item hiện có**.
- **Khi nào:** `useBulkPinProducts` - gọi ở **hai** chỗ (xem cuối mục).
- **Khác `positionBetween`:** hàm kia _chèn vào giữa_ nên phải chia đôi khoảng
  trống; hàm này _nối vào đuôi_ nên luôn còn chỗ, không bao giờ phải renumber và
  không bao giờ trả `null`.

```ts
export function resolveAppendPositions(items: PinnedProduct[], count: number): number[] {
  const positions = items
    .map((item) => item.position)
    .filter((position): position is number => position != null && Number.isFinite(position))

  const base = positions.length > 0 ? Math.max(...positions) : INITIAL_POSITION - POSITION_GAP

  return Array.from({ length: count }, (_, index) => base + (index + 1) * POSITION_GAP)
}
```

#### Bước 1 - lọc position rác

`position` khai báo là `number | null`, và dữ liệu server có thể chứa `NaN` /
`Infinity`. Không lọc thì `Math.max(100, null)` → `100` (null bị ép thành 0, còn
"may mắn"), nhưng `Math.max(100, NaN)` → **`NaN`**, và mọi position sinh ra sau
đó đều là `NaN` → ghi vào DB là hỏng cả scope. Lọc trước là rẻ và chặn đứt việc
đó.

#### Bước 2 - vì sao `Math.max` chứ không phải phần tử cuối mảng

Vì hàm này **không được phép giả định mảng đã sắp xếp**. Danh sách đọc qua
`useGetPinnedProducts` thì đã sort, nhưng `useBulkPinProducts` lấy dữ liệu bằng
`fetchQuery` - tức là **thứ tự thô của API**, chưa qua `select`.

```
API trả về (thứ tự thô):   C=49152    A=16384    B=32768
                                                 └── phần tử cuối mảng

Lấy phần tử cuối:  32768 + 16384 = 49152   ← TRÙNG position của C!
Lấy Math.max:      49152 + 16384 = 65536   ← đúng: thật sự nằm sau tất cả
```

Nhánh sai không chỉ "sắp xếp hơi lệch" - nó tạo ra **hai dòng cùng position**,
đúng loại dữ liệu bẩn mà `isNormalized()` phải đi dọn ở lần thao tác sau.

#### Bước 3 - vì sao `base = INITIAL_POSITION - POSITION_GAP` khi danh sách rỗng

Công thức sinh là `base + (index + 1) * GAP`, tức item đầu tiên luôn là
`base + GAP`. Muốn item đầu tiên của một scope trống rơi đúng vào
`INITIAL_POSITION` (giá trị mặc định server dùng khi mới ghim), phải trừ ngược
lại một `GAP`:

```
items = []      →  base = INITIAL_POSITION - GAP
count = 3       →  [INITIAL_POSITION, INITIAL_POSITION + GAP, INITIAL_POSITION + 2*GAP]
                    └── khớp mặc định server, không lệch pha
```

Nếu để `base = 0`, sản phẩm đầu tiên sẽ có position `16384` trong khi mọi
sản phẩm khác trong hệ thống ở quanh `2^47` - vẫn chạy được, nhưng số liệu nhìn
lệch hẳn và khó debug khi đối chiếu với DB.

#### Bước 4 - vì sao các position mới cách nhau `GAP`, không phải `+1`

Nếu ghim 3 sản phẩm liền nhau mà cấp position `X, X+1, X+2`, chúng vẫn đúng thứ
tự - nhưng **không thể chèn gì vào giữa chúng** (`MIN_GAP = 2` không thoả). Cú
kéo đầu tiên vào vùng đó sẽ lập tức kích hoạt `renumber()` toàn bộ. Cấp cách
nhau `GAP` giữ nguyên khả năng chèn giữa cho mọi khe mới sinh.

#### Bước 5 - hàm này không đụng tới item cũ

Trả về **chỉ** position cho item mới; `updates` gửi lên server cũng chỉ gồm item
mới. Đây là điểm khiến "ghim 20 sản phẩm" tốn 20 cặp `pin + move`, chứ không
phải 20 + N dòng cũ. Đổi lại, hàm **tin rằng danh sách hiện có đã sạch** - đó là
lý do `useBulkPinProducts` chủ động `renumber()` trước khi gọi nó nếu
`isNormalized()` fail.

#### Hai chỗ gọi, hai kết quả có thể khác nhau - và không sao cả

| Chỗ gọi      | Nguồn `items`                       | Mục đích                                    |
| ------------ | ----------------------------------- | ------------------------------------------- |
| `onMutate`   | `getQueryData` (cache, có thể cũ)   | Vẽ ngay thẻ tạm vào cuối bảng - chỉ để nhìn |
| `mutationFn` | `fetchQuery` (server, sau renumber) | Position **thật** ghi xuống DB              |

Hai lần chạy có thể ra hai bộ số khác nhau (cache chưa có item mà người khác vừa
ghim chẳng hạn). Không cần đồng bộ chúng: bộ số ở `onMutate` chỉ sống tới khi
`onSettled` invalidate và refetch, còn bộ số ở `mutationFn` mới là thứ được
persist. Điều duy nhất phải đúng ở `onMutate` là **thứ tự tương đối** - các thẻ
tạm phải nằm cuối bảng.

#### Còn dư bao nhiêu chỗ để append?

`INITIAL_POSITION` là `2^47` còn `Number.MAX_SAFE_INTEGER` là `2^53`, chia cho
`GAP = 2^14` → khoảng **5×10¹¹ lần append** trước khi chạm trần số nguyên an
toàn của JS. Thực tế không cần lo, nhưng nếu ai đó chỉnh `INITIAL_POSITION` lên
sát `MAX_SAFE_INTEGER` thì đây là chỗ vỡ đầu tiên.

---

### `resolveAppendPositionFor(pinned, productId): number | null`

- **Gì:** phiên bản "một item" của `resolveAppendPositions` - tính position để
  đẩy **một** product vừa ghim xuống cuối scope.
- **Khi nào:** `useUpdateProductPins` (dialog ghim một product vào nhiều scope
  cùng lúc từ bảng catalog). Đây là callsite **duy nhất**.

```ts
export function resolveAppendPositionFor(pinned: PinnedProduct[], productId: string): number | null {
  const others = pinned.filter((item) => item.productId !== productId)

  if (others.length === 0) return null

  return resolveAppendPositions(others, 1)[0]
}
```

#### Vì sao phải lọc bỏ chính `productId`

Nằm ở **thứ tự thao tác** trong `useUpdateProductPins`: pin trước, đọc danh sách
sau.

```ts
await productService.pinProduct({ body: { productId, isPin: true, categoryId } })
const pinned = await queryClient.fetchQuery(...)   // ← danh sách này ĐÃ chứa productId
const position = resolveAppendPositionFor(pinned, productId)
```

Tới lúc `fetchQuery` chạy, server đã tạo xong hàng ghim cho product đó với
position mặc định `INITIAL_POSITION`. Nếu không lọc ra, ta sẽ tính position mới
**dựa trên chính nó**:

```
Scope hiện có:  A=16384   B=32768
Vừa pin X → server gán X = INITIAL_POSITION (2^47, rất lớn)

Không lọc:  max(16384, 32768, 2^47) = 2^47   → X mới = 2^47 + GAP
            → position phình lên vô cớ mỗi lần ghim, và X "tự đuổi theo mình"

Có lọc:     max(16384, 32768)       = 32768  → X mới = 49152   ✔ đúng là cuối
```

Nhánh sai vẫn cho ra **thứ tự đúng** (X vẫn nằm cuối), nên bug này không lộ ra
khi test nhanh - nó chỉ khiến giá trị position leo thang dần và làm dữ liệu khó
đọc khi soi DB.

#### Vì sao trả `null` khi `others.length === 0`

`null` = "không cần làm gì". Đây là product **đầu tiên** của scope, position mặc
định server vừa gán (`INITIAL_POSITION`) đã hoàn toàn hợp lệ:

```ts
const position = resolveAppendPositionFor(pinned, productId)
if (position !== null) {
  await productService.moveProduct({ id: productId, position, categoryId })
}
```

→ tiết kiệm hẳn một request `move` cho mọi lần ghim đầu tiên vào một scope trống.

Đừng đổi `null` thành `INITIAL_POSITION`: kết quả giống nhau nhưng tốn thêm một
PUT không mang lại thông tin gì.

#### Vì sao không có nhánh renumber

Khác `useBulkPinProducts`, hook này **không** gọi `isNormalized`/`renumber`
trước. Đó là chủ ý: toàn bộ phần tính position ở đây nằm trong `try/catch` rỗng -
nếu có gì trục trặc thì cứ để position mặc định của server, lần kéo–thả sau sẽ
gặp dữ liệu bẩn và `renumber` dọn một thể. Dialog này là đường ghim phụ, không
đáng để nó tự bắn ra N request dọn dẹp.

---

### `resolveRestoreIndex(current, snapshot, productId): number`

- **Gì:** trả lời câu hỏi "thẻ vừa unpin nên quay về **ô thứ mấy**?" khi người
  dùng bấm Hoàn tác.
- **Khi nào:** trong callback `onClick` của nút Hoàn tác ở toast unpin, ngay
  trước `planInsert`.
- **Hai đầu vào:**
  - `current` - danh sách **hiện tại** (đã lọc bỏ `productId`), là nơi sẽ chèn vào.
  - `snapshot` - danh sách **tại thời điểm unpin**, chỉ dùng để tra "hồi đó nó
    đứng cạnh ai".

```ts
export function resolveRestoreIndex(current, snapshot, productId): number {
  const snapshotIndex = snapshot.findIndex((item) => item.productId === productId)

  if (snapshotIndex === -1) return current.length // không rõ vị trí cũ → cuối

  for (let index = snapshotIndex - 1; index >= 0; index--) {
    const predecessor = snapshot[index]
    if (predecessor.productId === productId) continue

    const currentIndex = current.findIndex((item) => item.productId === predecessor.productId)
    if (currentIndex !== -1) return currentIndex + 1 // ngay sau predecessor
  }

  return 0 // không còn ai đứng trước → lên đầu
}
```

#### Vì sao không dùng lại index cũ

Toast undo sống **8 giây**. Trong 8 giây đó người dùng hoàn toàn có thể kéo thẻ
khác, unpin thêm, hoặc ghim hàng loạt. Index `3` của lúc unpin không còn nghĩa gì
với danh sách lúc bấm Hoàn tác:

```
Lúc unpin:      [A, B, X, C, D]        X ở index 2
Trong 8 giây:   người dùng unpin luôn A và B

Lúc bấm Undo:   [C, D]
Dùng index cũ (2)  → [C, D, X]         X nhảy xuống cuối, sai hoàn toàn ✘
```

Position cũ cũng không dùng được vì cùng lý do - các thẻ xung quanh có thể đã
được cấp position mới.

#### Cách làm - "neo theo hàng xóm"

Ý tưởng: thứ mà người dùng nhớ không phải con số, mà là **thẻ nào đứng trước nó**.
Hàm đi ngược từ vị trí cũ trong `snapshot`, tìm predecessor **gần nhất vẫn còn
tồn tại** trong `current`, rồi chèn ngay sau người đó.

```
snapshot:   [A, B, X, C, D]        X từng đứng sau B
current:    [A, C, D]              B đã bị unpin trong lúc chờ

Đi ngược từ index của X (=2):
  index 1 → B  → tìm trong current → không thấy, đi tiếp
  index 0 → A  → tìm trong current → thấy ở index 0
                                   → trả về 0 + 1 = 1

Kết quả:    [A, X, C, D]           ✔ "nằm sau A" - đúng như trước
```

#### Ba lối ra

| Lối ra             | Khi nào                                             | Kết quả           |
| ------------------ | --------------------------------------------------- | ----------------- |
| `current.length`   | Không tìm thấy `productId` trong `snapshot`         | Append cuối       |
| `currentIndex + 1` | Tìm được predecessor còn sống                       | Ngay sau nó       |
| `0`                | Vòng lặp chạy hết mà không predecessor nào còn sống | Lên đầu danh sách |

Lối ra `0` xảy ra khi X từng đứng đầu, hoặc mọi thẻ đứng trước nó đều đã biến
mất. Trả về `0` (lên đầu) hợp lý hơn là append cuối: nếu X từng ở nửa trên của
danh sách, đẩy nó xuống đáy là sai lệch lớn hơn nhiều.

#### Dòng `continue` trông thừa nhưng là phòng thủ

```ts
if (predecessor.productId === productId) continue
```

Trong luồng bình thường, `snapshot` không thể chứa `productId` hai lần. Dòng này
chặn trường hợp dữ liệu server trùng lặp - nếu không có nó, hàm có thể "neo X vào
chính X", và `planInsert` sẽ tính position dựa trên một hàng đã bị xoá.

#### Vì sao đây là thiết kế đúng về mặt UX

> Về mặt cảm nhận của người dùng, "nó quay lại nằm sau sản phẩm X" ổn định và dễ
> hiểu hơn nhiều so với "nó quay lại đúng ô thứ 4". Neo theo hàng xóm luôn cho
> một kết quả **hợp lý** kể cả khi danh sách đã thay đổi nhiều, còn neo theo chỉ
> số thì sai một cách khó đoán.

Đánh đổi cần biết: nếu người dùng **chủ động kéo** thẻ predecessor sang chỗ khác
trong lúc chờ, thẻ được restore sẽ đi theo predecessor chứ không về vị trí hình
học cũ. Đây là hành vi **có chủ ý** - "đi theo hàng xóm" vẫn dễ giải thích hơn
"về ô số 4 mà giờ ô đó là thứ khác".

---

## Tầng 2 - Hooks mutation

Cả bốn hook mutation của scope (`reorder`, `unpin`, `restore`, `bulkPin`) dùng
chung **cùng một `mutationKey`** và **cùng một `scope.id`**:

```ts
// query-keys.ts
pinned: (categoryId) => ['products', 'pinned', categoryId ?? null]
pinnedMutation: (categoryId) => [...pinned(categoryId), 'mutation']
pinnedScope: (categoryId) => `pinned-${categoryId ?? 'global'}`
```

Ba thứ này phục vụ ba mục đích khác nhau - đừng gộp:

| Key                | Dùng để                                                                                       |
| ------------------ | --------------------------------------------------------------------------------------------- |
| `pinned()`         | Query key của danh sách - đọc, ghi optimistic, invalidate                                     |
| `pinnedMutation()` | **Đếm** số mutation đang chạy trên scope (`queryClient.isMutating`) và lọc `useMutationState` |
| `pinnedScope()`    | React Query **serialise** các mutation cùng scope - chạy tuần tự, không đua nhau              |

### Hai pattern lặp lại trong mọi hook - đọc kỹ

#### 1. `isMutating({ mutationKey }) <= 1` trong `onError`

```ts
if (context?.previous && queryClient.isMutating({ mutationKey }) <= 1) {
  queryClient.setQueryData(queryKey, context.previous)
}
```

- **Vấn đề:** người dùng kéo 3 lần liên tiếp rất nhanh. Nếu lần kéo thứ 1 lỗi,
  nó sẽ rollback về snapshot của **chính nó** - tức là xoá luôn kết quả của lần
  kéo 2 và 3 mà người dùng đang nhìn thấy.
- **Giải pháp:** chỉ rollback khi mình là mutation **cuối cùng còn sống**. Nếu
  còn mutation khác đang chạy, để `onSettled` của mutation cuối cùng invalidate
  và đồng bộ lại từ server.
- **Vì sao `<= 1` mà không phải `=== 0`:** một mutation vẫn được tính là
  `pending` khi đang chạy chính callback của nó. `1` chính là bản thân nó.

#### 2. `isMutating({ mutationKey }) > 1` trong `onSettled`

```ts
if (queryClient.isMutating({ mutationKey }) > 1) return
queryClient.invalidateQueries({ queryKey })
```

- **Vấn đề:** invalidate → refetch trong khi một write khác chưa xong. Server trả
  về danh sách **chưa** chứa thay đổi đang bay → UI "nhảy ngược về thứ tự cũ",
  rồi vài trăm ms sau lại nhảy tiếp. Đây chính là bug "thứ tự bị snap back".
- **Giải pháp:** chỉ mutation cuối cùng mới được invalidate.

### `use-reorder-pinned-products.ts`

- **Gì:** persist một `PinnedReorderPlan` - chạy `Promise.all` các
  `moveProduct` trong `plan.updates`.
- **Điểm khác biệt lớn nhất:** hook này **không có `onMutate`** và **không tự ghi
  cache**. Việc ghi optimistic do `usePinnedBoard.commitPlan` làm - xem
  [phần dưới](#vì-sao-commitplan-ghi-cache-thay-vì-onmutate) để hiểu lý do.
- Caller truyền kèm `previous` (snapshot trước khi ghi) để hook có cái mà rollback.
- `pendingIds` được suy ra từ `plan.updates` → chỉ những thẻ thực sự bị đổi
  position mới hiện spinner.

### `use-unpin-pinned-product.ts`

Hook này chứa **hai** mutation: `unpin` và `restore`.

**Vì sao có undo thay vì dialog xác nhận:** unpin là một click trên đúng bề mặt
mà người dùng đang rê chuột liên tục khi sắp xếp. Ghim lại "đường vòng" tốn một
chuyến sang bảng catalog **và** mất vị trí cũ. Một dialog confirm cho mỗi lần
unpin thì quá phiền khi đang curate hàng loạt. Undo 8 giây (`UNDO_TOAST_DURATION`)
giải quyết cả hai.

Luồng undo:

```
unpin thành công
  → toast (8s) với nút Hoàn tác, mang theo `snapshot = context.previous`
  → user bấm Hoàn tác
     → đọc danh sách HIỆN TẠI từ cache (không dùng snapshot làm nguồn)
     → resolveRestoreIndex(current, snapshot, productId)   ← snapshot chỉ cung cấp "hàng xóm"
     → planInsert(current, product, index)
     → restore(): pinProduct(isPin: true) rồi moveProduct(...plan.updates)
```

> **Tinh tế:** `restore` gọi `pinProduct` **trước**, `moveProduct` **sau**, và
> tuần tự (`await` chứ không `Promise.all`) - hàng ghim phải tồn tại trước khi
> ghi được position cho nó.

`onSettled` của `unpin` còn invalidate `productKeys.detail()` và
`productKeys.lists()` vì trạng thái ghim hiển thị cả trong bảng catalog và trang
chi tiết sản phẩm.

### `use-bulk-pin-products.ts`

- **Gì:** ghim cả một selection vào cuối danh sách trong một thao tác.
- **`ensureCategoryMembership` trước tiên:** endpoint pin ghi row junction
  product ↔ category, nên product **phải** đã thuộc category. Sheet cho phép
  chọn sản phẩm ngoài category, nên phần này gán membership trước.
- **`fetchQuery` thay vì đọc cache:** cache lúc này có thể đang ở trạng thái
  optimistic (`onMutate` vừa append các thẻ tạm). Tính "append cuối" trên dữ liệu
  đó sẽ sai. `fetchQuery` lấy danh sách thật từ server.
- **Renumber chủ động:** nếu list server không normalized thì renumber trước, vì
  `resolveAppendPositions` dựa vào max position - dữ liệu bẩn khiến "append" không
  thực sự là cuối.
- **`mapWithConcurrency(candidates, 4, …)`:** giới hạn 4 cặp `pin` + `move` song
  song. Batch 32 sản phẩm mà bắn hết một lúc sẽ đụng trần connection của trình duyệt.
- **`PromiseSettledResult` - không abort cả batch:** một sản phẩm lỗi không kéo
  theo phần còn lại. Kết quả trả về `{ succeeded, failed }` và **không rollback
  batch lẻ** - những sản phẩm đã ghim là ghim thật, rollback sẽ nói dối UI. Thay
  vào đó hiện `toast.warning` báo thành công một phần.
- `MAX_BULK_PIN = 32` được chặn ở UI (`add-pinned-products-sheet.tsx`) để một
  selection chạy loạn không biến thành hàng trăm PUT.

### `use-update-product-pins.ts`

Khác các hook trên: đây là "ghim **một** product vào **nhiều** scope cùng lúc"
(dùng từ dialog trong bảng catalog), không phải "sắp xếp một scope".

- Vòng lặp **tuần tự** (`for … of`, không `Promise.all`) vì mỗi scope cần đọc lại
  danh sách để tính append-position, và phép đọc đó phải thấy được cái pin vừa ghi.
- Phần tính position bọc trong `try/catch` rỗng có chủ ý: nếu không đọc được
  danh sách scope, cứ để position mặc định của server - lần kéo sau sẽ renumber sạch.
- `useUpdatingProductPinId()` đọc `useMutationState` thay vì `variables` của hook,
  vì component **kích hoạt** (dòng trong bảng catalog) và component **sở hữu
  mutation** (dialog) là hai component khác nhau.

---

## Tầng 3 - `use-pinned-board.ts` (điều phối)

Đây là API duy nhất mà page dùng. Mục tiêu: page chỉ còn là file layout, không
bao giờ chạm `queryClient`.

### Hai danh sách - `items` vs `visibleItems`

```ts
items // danh sách THẬT, đầy đủ - mọi position tính trên đây
visibleItems // chỉ những gì search để lại trên màn hình
```

**Đây là invariant quan trọng nhất của file.** Mọi handler reorder đều tìm index
trong `items` **theo id**:

```ts
const fromIndex = items.findIndex((p) => p.productId === active.id)
const toIndex = items.findIndex((p) => p.productId === over.id)
```

Nếu ai đó "tối ưu" bằng cách tính index trên `visibleItems`, sản phẩm sẽ **âm
thầm** nhảy sai chỗ khi đang có filter - index 2 trong danh sách đã lọc có thể là
index 17 trong danh sách thật.

### `pendingIds` - đọc từ mutation cache

```ts
const pendingIdLists = useMutationState({
  filters: { mutationKey: productKeys.pinnedMutation(categoryId), status: 'pending' },
  select: (m) => (m.state.variables as PinnedScopeVariables | undefined)?.pendingIds ?? []
})
```

- **Tại sao không dùng `isPending` của từng hook:** reorder, unpin, restore và
  bulk-pin đều dùng chung mutation key và **nhiều cái có thể chạy đồng thời**.
  Một cờ boolean sẽ đóng băng cả bảng.
- **Cách làm:** mỗi mutation nhét `pendingIds: string[]` vào `variables` của nó
  (đó là lý do tồn tại của interface `PinnedScopeVariables`). Hook gom tất cả
  `pendingIds` đang pending lại thành một `Set` → **chỉ đúng những thẻ bị ảnh
  hưởng** hiện spinner.

### `commitPlan` - trái tim của phần DnD

```ts
const commitPlan = useCallback(
  (plan) => {
    queryClient.cancelQueries({ queryKey })
    const previous = queryClient.getQueryData<PinnedProduct[]>(queryKey)
    queryClient.setQueryData<PinnedProduct[]>(queryKey, plan.items)
    reorderPinnedProducts(plan, previous)
  },
  [queryClient, queryKey, reorderPinnedProducts]
)
```

#### Vì sao `commitPlan` ghi cache thay vì `onMutate`?

Đây là chỗ trái với thói quen React Query nhất, và cũng là chỗ dễ bị "refactor
cho đúng chuẩn" nhất - **đừng**.

`onMutate` của `useMutation` luôn được gọi qua `execute()` nội bộ của `mutate()`,
và hàm này `await` ít nhất một hook trước khi tới `onMutate` của ta. Nghĩa là
việc ghi cache rơi xuống **tick sau** của React scheduler, trong một lần render riêng.

Trong khi đó, dnd-kit **reset transform của thẻ đang kéo ngay khoảnh khắc
`isDragging` chuyển thành `false`**. Nếu cache chưa có thứ tự mới tại thời điểm
đó, kết quả là:

```
frame N   : thả chuột → isDragging = false → transform reset → thẻ vẽ ở ô CŨ
frame N+1 : onMutate chạy → cache có thứ tự mới → thẻ nhảy sang ô MỚI
```

→ người dùng thấy thẻ **giật ngược về chỗ cũ rồi mới nhảy** - cảm giác vỡ.

Vì vậy `commitPlan` ghi cache **đồng bộ, trong cùng call stack** với sự kiện
`onDragEnd`, thậm chí trước cả khi `setActiveId(null)` commit. Mutation bên dưới
chỉ còn nhiệm vụ **persist qua mạng và rollback khi lỗi**.

Cùng lý do đó, trong `onDragEnd` thứ tự hai dòng này **không được đảo**:

```ts
if (plan) commitPlan(plan) // ghi cache TRƯỚC
setActiveId(null) // rồi mới kết thúc drag
```

### Các handler

| Handler        | Khi nào                          | Làm gì                                                      |
| -------------- | -------------------------------- | ----------------------------------------------------------- |
| `onDragStart`  | Bắt đầu kéo                      | Lưu `activeId` → dùng cho `DragOverlay` và ẩn fold divider  |
| `onDragEnd`    | Thả                              | Tìm index theo id trong `items` → `planMove` → `commitPlan` |
| `onDragCancel` | Nhấn Esc / huỷ                   | Xoá `activeId`, không đụng cache                            |
| `moveToIndex`  | Menu ⋮ (lên/xuống/đầu/cuối/số N) | Clamp index → `planMove` → `commitPlan`                     |
| `unpin`        | Menu ⋮ → Bỏ ghim                 | Uỷ quyền thẳng cho `useUnpinPinnedProduct`                  |

Cả `onDragEnd` và `moveToIndex` đều thoát sớm khi `plan === null` (không có gì đổi).

---

## Tầng 4 - UI

### `pinned-products.page.tsx`

Cấu hình DnD:

```tsx
<DndContext
  sensors={sensors}                    // useDndSensors: mouse 6px, touch delay 250ms, keyboard
  collisionDetection={closestCenter}
  onDragStart={board.onDragStart}
  onDragEnd={board.onDragEnd}
  onDragCancel={board.onDragCancel}
>
  <SortableContext
    items={board.itemIds}
    strategy={view === 'list' ? verticalListSortingStrategy : rectSortingStrategy}
  >
```

- **`rectSortingStrategy` cho grid, `verticalListSortingStrategy` cho list:**
  grid nhiều cột cần tính toán theo hình chữ nhật 2 chiều; chiến lược list chỉ
  hiểu một trục dọc.
- **Sensors** (`src/components/dnd/use-dnd-sensors.ts`): mouse cần di 6px mới
  kích hoạt (để click vẫn là click); touch cần giữ 250ms (để cuộn trang vẫn
  cuộn được); keyboard cho phép sắp xếp bằng bàn phím.

#### Ba nhánh render - và vì sao chúng khác nhau

1. **Đang filter (`board.isFiltering`)** → render `PinnedProductCard` **thuần**,
   không bọc sortable.

   > Không phải "sortable bị disable" mà là **không có sortable**. Khi thứ tự
   > hiển thị không khớp thứ tự thật, kéo–thả sẽ tính ra index vô nghĩa. Và một
   > con trỏ hình bàn tay nắm mà kéo không được thì tệ hơn là không có nó.
   > Menu ⋮ vẫn hoạt động bình thường vì nó địa chỉ hoá **vị trí tuyệt đối**
   > trong danh sách đầy đủ. `position` hiển thị trên thẻ cũng lấy từ index
   > trong `board.items`, không phải trong danh sách đã lọc.

2. **Bình thường** → `SortablePinnedProductCard` trong `SortableContext`.

3. **Loading / error / rỗng** → skeleton hoặc `PinnedProductsEmptyState` với ba
   biến thể `error | filtered | empty` (lỗi tải và "chưa ghim gì" phải phân biệt
   được, nếu không người dùng tưởng scope trống trong khi thực ra API hỏng).

#### `PinnedFoldDivider` - vạch cắt của storefront

Storefront render mỗi category thành lưới `rows × cols` cố định (đọc từ
`metaData` của category). Sản phẩm nằm sau ô thứ `rows × cols` là **đã ghim
nhưng không ai nhìn thấy**. Divider đánh dấu ranh giới đó, và các thẻ phía sau
nhận `isBeyondFold` để làm mờ.

```tsx
{
  foldCount != null && index === foldCount && !board.activeId && <PinnedFoldDivider t={t} count={foldCount} />
}
```

**`!board.activeId` - ẩn divider khi đang kéo:** divider là một ô lưới thường,
**không phải sortable item**. Sự hiện diện của nó làm lệch phép tính rect mà
sorting strategy dùng để trượt các thẻ vào chỗ → nhìn giật quanh vùng fold.

Scope global **không có** divider (`foldCount = null`) vì không có config tương
đương cho danh sách trang chủ - thà không vẽ còn hơn vẽ một con số đoán.

### `sortable-pinned-product-card.tsx`

Wrapper mỏng quanh `useSortable`. Hai điểm:

- **`opacity: isDragging ? 0.4 : 1`** - thẻ gốc mờ đi, còn `DragOverlay` mới là
  cái đi theo con trỏ. Nhờ vậy overlay không bị cắt bởi `overflow` của container.
- **`setActivatorNodeRef`** được truyền vào drag handle: đây là thứ trỏ keyboard
  sensor tới đúng nút, để khi nhấn Space nó thông báo từ nút người dùng đang focus.

`PinnedProductCard` được tách riêng, không biết gì về dnd-kit, nên dùng lại được
cho cả `DragOverlay` lẫn nhánh filter.

### `pinned-product-actions-menu.tsx` + `move-to-position-popover.tsx`

Menu ⋮ là **con đường thay thế cho kéo–thả**, không phải tính năng phụ:

- Danh sách dài, đích đến nằm ngoài màn hình → kéo rất khổ.
- Layout 1 cột trên mobile → kéo phải đánh nhau với cuộn trang suốt hành trình.
- Đang có filter → kéo bị tắt hoàn toàn.

Mọi thao tác trong menu đều dùng **index tuyệt đối trong danh sách đầy đủ**
(prop `index` được page truyền từ `board.items`), nên vẫn đúng khi đang lọc.

Hai chi tiết dễ hỏng nếu chỉnh:

```tsx
onPointerDown={(event) => event.stopPropagation()}  // trên nút ⋮
```

Không có dòng này, việc bấm nút sẽ khởi động một cú drag trên sortable wrapper.

```tsx
onCloseAutoFocus={(event) => { if (isMoveOpen) event.preventDefault() }}
```

Item "Nhảy tới vị trí" **mở popover** thay vì đóng menu hẳn. Mặc định dropdown
sẽ giành lại focus khi đóng, cướp mất focus của ô input trong popover đang mở.

`MoveToPositionPopover` dùng `PopoverAnchor` chứ không phải `PopoverTrigger` (nó
được mở từ dropdown item, không phải từ chính nó), nhận **vị trí 1-based** để
hiển thị nhưng gọi `onMove` với **index 0-based** - ranh giới quy đổi nằm đúng ở
`onMove(parsed - 1)`.

---

## Luồng chạy đầy đủ

### A. Kéo thả một thẻ

```
1. Người dùng nhấn giữ và di ≥ 6px trên drag handle
2. DndContext.onDragStart → board.onDragStart → setActiveId(id)
   → thẻ gốc mờ 0.4, DragOverlay hiện bản sao đi theo chuột
   → fold divider ẩn (tránh lệch rect math)
3. Thả chuột → board.onDragEnd
   ├─ không có `over` hoặc thả lại chỗ cũ → chỉ setActiveId(null), dừng
   ├─ fromIndex / toIndex = findIndex theo id trong `items` (KHÔNG phải visibleItems)
   ├─ planMove(items, from, to)
   │    ├─ arrayMove → thứ tự mới
   │    ├─ isNormalized(resting)?  không → renumber toàn bộ
   │    └─ positionBetween → null?  → renumber; ngược lại 1 update
   ├─ commitPlan(plan)   ← ĐỒNG BỘ, trong cùng call stack
   │    ├─ cancelQueries (chặn refetch đang bay ghi đè)
   │    ├─ previous = getQueryData  (để rollback)
   │    ├─ setQueryData(plan.items) → UI cập nhật NGAY frame này
   │    └─ reorderPinnedProducts(plan, previous)
   └─ setActiveId(null)  ← SAU commitPlan
4. Mutation chạy: Promise.all(plan.updates.map(moveProduct))
   ├─ Thành công → onSettled → nếu là mutation cuối → invalidateQueries
   └─ Lỗi → nếu là mutation cuối → setQueryData(previous) + toast lỗi
```

### B. Unpin rồi Undo

```
1. Menu ⋮ → Bỏ ghim → unpin({ product, pendingIds: [id] })
2. onMutate: snapshot `previous`, xoá thẻ khỏi cache ngay
3. onSuccess: toast 8 giây kèm nút Hoàn tác, closure giữ `snapshot`
4. Bấm Hoàn tác:
   ├─ current = cache HIỆN TẠI (đã lọc bỏ product) ← không dùng snapshot làm nguồn
   ├─ index = resolveRestoreIndex(current, snapshot, id)
   │    → tìm predecessor gần nhất trong snapshot mà `current` vẫn còn
   ├─ plan = planInsert(current, product, index)
   └─ restore(): pinProduct(isPin:true) → await → moveProduct(...updates)
5. onSettled: invalidate detail + lists + (nếu là mutation cuối) danh sách pinned
```

### C. Ghim hàng loạt từ sheet

```
1. Chọn sản phẩm trong AddPinnedProductsSheet (tối đa 32)
2. bulkPinProducts({ candidates, assignProductIds })
3. onMutate: append thẻ tạm vào cache với position từ resolveAppendPositions
   → sheet vẫn mở, các dòng vừa chọn lập tức chuyển thành "đã ghim"
      (vì `pinnedIds` đọc chính cache optimistic này)
4. mutationFn:
   ├─ ensureCategoryMembership (nếu có sản phẩm ngoài category)
   ├─ fetchQuery → danh sách THẬT từ server
   ├─ isNormalized? không → renumber trước khi append
   ├─ resolveAppendPositions(tail, n)
   └─ mapWithConcurrency(4): pin → move, từng cặp một, allSettled
5. onSuccess: toast thành công, hoặc toast.warning nếu có lỗi một phần
   (KHÔNG rollback batch lẻ - những cái đã ghim là ghim thật)
```

---

## Những quyết định dễ bị "sửa nhầm"

Bảng này liệt kê các đoạn code **trông như thừa hoặc sai chuẩn** nhưng có lý do
cụ thể. Nếu định sửa, hãy đọc cột "Hậu quả nếu bỏ" trước.

| Code                                                                 | Nằm ở                         | Hậu quả nếu bỏ                                                                   |
| -------------------------------------------------------------------- | ----------------------------- | -------------------------------------------------------------------------------- |
| `commitPlan` ghi cache thay vì `onMutate`                            | `use-pinned-board.ts`         | Thẻ giật ngược về ô cũ 1 frame sau khi thả                                       |
| `commitPlan(plan)` **trước** `setActiveId(null)`                     | `onDragEnd`                   | Y hệt trên                                                                       |
| `findIndex` trên `items`, không phải `visibleItems`                  | `use-pinned-board.ts`         | Sản phẩm nhảy sai vị trí khi đang lọc - **âm thầm**, không có lỗi                |
| `isMutating(...) <= 1` trong `onError`                               | mọi hook mutation             | Kéo nhanh liên tiếp + 1 lần lỗi → mất luôn các thay đổi sau đó                   |
| `isMutating(...) > 1` trong `onSettled`                              | mọi hook mutation             | Bug "thứ tự snap back": refetch ghi đè lên write đang bay                        |
| Lọc bỏ item vừa move trước khi `isNormalized`                        | `planMove`                    | Mọi cú kéo đều renumber toàn bộ → N request thay vì 1                            |
| `isNormalized(items)` (list cũ) chứ không phải `inserted`            | `planInsert`                  | Item mới chưa có position luôn làm fail → luôn renumber                          |
| `resolveAppendPositionFor` lọc bỏ chính `productId`                  | `use-update-product-pins.ts`  | Tính position dựa trên chính nó → position sai                                   |
| `fetchQuery` thay vì `getQueryData`                                  | `use-bulk-pin-products.ts`    | Tính "append cuối" trên cache optimistic → thứ tự sai                            |
| `!board.activeId` khi render fold divider                            | `pinned-products.page.tsx`    | Rect math lệch → thẻ giật quanh vùng fold khi kéo                                |
| `onPointerDown` + `stopPropagation` trên nút ⋮                       | `pinned-product-actions-menu` | Bấm menu vô tình khởi động drag                                                  |
| `onCloseAutoFocus` + `preventDefault`                                | `pinned-product-actions-menu` | Dropdown cướp focus khỏi input của popover                                       |
| `sortByPosition` định nghĩa ở module scope                           | `use-get-pinned-products.ts`  | `select` trả identity mới mỗi render → mất referential equality                  |
| `select: sortByPosition`                                             | `use-get-pinned-products.ts`  | Thứ tự nhảy loạn sau refetch khi server trả position trùng                       |
| `queryFn: () => service.getPinnedProducts({ categoryId })` (closure) | `use-get-pinned-products.ts`  | Truyền thẳng hàm service → nhận context của React Query → `CategoryId=undefined` |
| Không rollback khi bulk pin lỗi một phần                             | `use-bulk-pin-products.ts`    | UI nói dối: xoá mất những sản phẩm đã ghim thành công                            |
| `scope: { id: pinnedScope(categoryId) }`                             | mọi hook mutation             | Các request `move` đua nhau → server nhận sai thứ tự                             |

---

## Troubleshooting

### "Kéo xong thẻ nhảy về chỗ cũ rồi mới sang chỗ mới"

Cache được ghi trễ một tick. Kiểm tra `commitPlan` có còn được gọi **đồng bộ**
trong `onDragEnd` không, và có ai đó chuyển nó vào `onMutate` không.

### "Kéo xong một lúc thì thứ tự tự nhảy về cũ"

Refetch ghi đè lên write đang bay. Kiểm tra guard `isMutating(...) > 1` trong
`onSettled` của **tất cả** hook mutation dùng chung `pinnedMutation` key - chỉ
cần một hook thiếu là đủ gây bug.

### "Kéo một cái mà bắn ra hàng chục request PUT"

Đang bị renumber liên tục. Nguyên nhân thường gặp:

- Dữ liệu server có position trùng/null → renumber là **đúng**, nhưng chỉ nên xảy
  ra **một lần**. Nếu lặp lại mãi, `moveProduct` có thể không lưu được position.
- `planMove` bị sửa mất bước lọc `resting` → mọi cú kéo đều bị coi là dữ liệu bẩn.
- Khoảng trống thật sự cạn (chèn cùng một khe quá nhiều lần) → đây là hành vi
  đúng, một lần renumber sẽ mở lại khoảng trống.

### "Sản phẩm nhảy sai chỗ khi đang tìm kiếm"

Có chỗ nào đó dùng `visibleItems` để tính index. Mọi phép tính vị trí phải dựa
trên `items`.

### "Spinner hiện trên cả bảng thay vì một thẻ"

Có hook nào đó không nhét `pendingIds` vào `variables`, hoặc UI đang đọc
`isPending` của hook thay vì `board.pendingIds`.

### "Ghim vào category báo lỗi membership"

`ensureCategoryMembership` ném `MembershipUnavailableError` khi category không
trả về `productIds`. Kiểm tra response của `categoryService.getCategory`.

---

## Checklist khi sửa/thêm tính năng

Thêm một thao tác mới làm đổi thứ tự (ví dụ "đảo ngược danh sách", "sắp theo
giá"):

- [ ] Viết hàm thuần trong `reorder-utils.ts` trả về `PinnedReorderPlan`, không
      gọi API, không đụng React.
- [ ] Bắt đầu bằng `isNormalized()`, fallback `renumber()` - không giả định dữ
      liệu server sạch.
- [ ] Giữ `updates` tối thiểu; đừng trả về cả danh sách nếu chỉ 1 item đổi.
- [ ] Expose handler qua `usePinnedBoard`, gọi `commitPlan()` - **không** cho
      page tự gọi `queryClient`.
- [ ] Tính index trên `items`, không phải `visibleItems`.

Thêm một mutation mới trên scope pinned:

- [ ] Dùng đúng `productKeys.pinnedMutation(categoryId)` làm `mutationKey`.
- [ ] Dùng đúng `scope: { id: productKeys.pinnedScope(categoryId) }`.
- [ ] Nhét `pendingIds: string[]` vào biến của mutation (`PinnedScopeVariables`).
- [ ] `onError`: guard `isMutating(...) <= 1` trước khi rollback.
- [ ] `onSettled`: guard `isMutating(...) > 1` trước khi invalidate.
- [ ] Invalidate thêm `detail()` / `lists()` / `listsInfinite()` nếu thao tác làm
      đổi trạng thái ghim (bảng catalog và trang chi tiết cũng hiển thị nó).

Đụng vào phần render DnD:

- [ ] Phần tử không phải sortable (divider, header…) phải ẩn khi `activeId` khác
      `null`, nếu không rect math sẽ lệch.
- [ ] Nút/menu bên trong thẻ phải `stopPropagation` ở `onPointerDown`.
- [ ] `SortableContext.items` phải khớp đúng thứ tự và đủ phần tử của `items`.
- [ ] Đổi layout grid ↔ list thì đổi cả sorting strategy tương ứng.

Trước khi mở PR:

- [ ] `yarn check` (lint + `tsc -b`).
- [ ] Test tay: kéo ở view grid **và** list; kéo khi đang bật filter (phải không
      kéo được); unpin rồi undo sau khi đã kéo thẻ khác; ghim hàng loạt rồi kéo ngay.
- [ ] Test cả scope global **và** scope category.
