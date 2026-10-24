from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'public/templates/marketing-posts-bulk-v3.xlsx'
NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'

def cell(column, row, value, style=0):
    return f'<c r="{column}{row}" t="inlineStr" s="{style}"><is><t xml:space="preserve">{escape(str(value))}</t></is></c>'

def sheet(rows, widths, validations=()):
    select_columns = {col for col, _, _ in validations}
    body = ''.join(f'<row r="{i}" ht="{32 if i == 1 else 48}" customHeight="1">'+''.join(cell(chr(65+j), i, value, 1 if i == 1 else 2 if chr(65+j) in select_columns else 0) for j,value in enumerate(row))+'</row>' for i,row in enumerate(rows,1))
    cols = ''.join(f'<col min="{i}" max="{i}" width="{width}" customWidth="1" style="{2 if chr(64+i) in select_columns else 0}"/>' for i,width in enumerate(widths,1))
    rules = ''
    for col, values, limit in validations:
        formula = values[1:] if values.startswith('=') else f'"{values}"'
        rules += (f'<dataValidation type="list" errorStyle="stop" allowBlank="1" showDropDown="0" '
                  f'showInputMessage="1" showErrorMessage="1" promptTitle="Chọn từ danh sách" '
                  f'prompt="Bấm mũi tên bên phải ô để chọn giá trị." errorTitle="Giá trị chưa hợp lệ" '
                  f'error="Chỉ chọn giá trị trong danh sách, không nhập giá trị khác." '
                  f'sqref="{col}2:{col}{limit}"><formula1>{escape(formula)}</formula1></dataValidation>')
    validation_xml = f'<dataValidations count="{len(validations)}">{rules}</dataValidations>' if validations else ''
    return f'<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="{NS}"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>{cols}</cols><sheetData>{body}</sheetData><autoFilter ref="A1:{chr(64+len(widths))}{len(rows)}"/>{validation_xml}</worksheet>'

sheets = [
 ('Bai_dang', sheet([
 ['Mã bài','Tiêu đề','Nội dung','AI nội dung','Hashtag','Kênh đăng','Ngày giờ đăng'],
 ['HTM-001','Bó Hồng Jubilee','Bó Hồng Jubilee mang sắc hồng dịu dàng, dành tặng người bạn yêu thương. Nhắn tin cho Hoa Theo Mùa để được tư vấn.','Không','#HoaTheoMua #BoHong','Facebook, Instagram, Zalo OA',''],
 ],[18,28,75,18,26,32,25],[('D','Có,Không',501),('F','=KenhDang',501)])),
 ('Anh', sheet([
 ['Mã bài','Nền tảng','Thứ tự','Đường dẫn ảnh','Xử lý ảnh','Tỉ lệ đầu ra','Yêu cầu AI'],
 ['HTM-001','Facebook',1,'https://example.com/thay-bang-anh-san-pham.jpg','Giữ nguyên','Gốc',''],
 ['HTM-001','Instagram',1,'https://example.com/thay-bang-anh-san-pham.jpg','Giữ nguyên','Gốc',''],
 ['HTM-001','Zalo OA',1,'https://example.com/thay-bang-anh-san-pham.jpg','Giữ nguyên','Gốc',''],
 ],[18,20,12,65,25,20,65],[('A','=MaBai',10001),('B','Facebook,Instagram,Zalo OA',10001),('E','Giữ nguyên,Xử lý bằng AI',10001),('F','=IF($E2="Xử lý bằng AI",TiLeAI,TiLeGoc)',10001)])),
 ('Huong_dan', sheet([
 ['Mục','Hướng dẫn'],
 ['Mẫu v3','Thay dữ liệu ví dụ trước khi nhập. URL example.com chỉ minh họa, phải thay bằng link ảnh công khai thật. Không dùng công thức.'],
 ['AI nội dung','Có: dùng ô Nội dung làm yêu cầu để AI viết caption hoàn chỉnh riêng cho từng nền tảng. Không hoặc trống: giữ nguyên nội dung.'],
 ['Ô lựa chọn (màu xanh nhạt)','Bấm vào ô rồi bấm mũi tên ở bên phải để chọn. Excel sẽ chặn giá trị nhập tay không thuộc danh sách.'],
 ['Kênh đăng','Chọn một kênh hoặc một nhóm kênh có sẵn trong dropdown, không cần tự gõ danh sách phân cách bằng dấu phẩy.'],
 ['Mã bài của ảnh','Tạo Mã bài ở sheet Bai_dang trước, sau đó chọn mã tương ứng trong dropdown của sheet Anh.'],
 ['Tỉ lệ đầu ra','Dropdown phụ thuộc Xử lý ảnh: Giữ nguyên chỉ chọn Gốc; Xử lý bằng AI chọn một trong năm tỉ lệ. Khi đổi cách xử lý, chọn lại tỉ lệ.'],
 ['Các ô nhập tự do','Mã bài mới, tiêu đề, nội dung, hashtag, URL ảnh, yêu cầu AI, thứ tự và ngày giờ vẫn cần điền theo dữ liệu thực tế.'],
 ['Giờ đăng','Để trống: lưu Chờ đăng trên hệ thống, KHÔNG đăng ngay. Mở bài để duyệt, Đăng ngay hoặc Hẹn giờ sau.'],
 ['Có giờ đăng','Nhập dd/MM/yyyy HH:mm theo giờ Việt Nam, trong tương lai. Chỉ hẹn đăng sau khi AI và kiểm tra dữ liệu thành công. Không chuyển lịch lỗi/quá hạn thành đăng ngay.'],
 ['Ảnh theo nền tảng','Mỗi dòng = một ảnh của một bài trên một nền tảng. Thứ tự riêng từng nền tảng. Cùng link có thể lặp ở Facebook và Instagram.'],
 ['Giữ nguyên','Giữ ảnh và URL gốc; không gọi AI, không tự cắt. Tỉ lệ đầu ra để Gốc hoặc trống. Nếu ảnh không đạt yêu cầu nền tảng, bài báo lỗi thay vì tự sửa ảnh.'],
 ['Xử lý bằng AI','Chọn tỉ lệ 1:1, 4:5, 3:4, 9:16 hoặc 16:9. Có thể thêm Yêu cầu AI, ví dụ: mở rộng nền sáng, giữ nguyên bó hoa và không thêm chữ.'],
 ['Ví dụ cùng ảnh','Facebook: Xử lý bằng AI, 1:1. Instagram: Xử lý bằng AI, 4:5. Zalo OA: Giữ nguyên, Gốc. Tạo 3 dòng riêng dùng cùng link.'],
 ['Tỉ lệ không phải loại bài','Chọn 9:16 không có nghĩa hệ thống tự đăng Story/Reel. Khả năng đăng và tỉ lệ hợp lệ còn phụ thuộc loại bài của từng kênh.'],
 ['AI và chi phí','Chỉ lựa chọn Có hoặc Xử lý bằng AI mới gọi AI. Tối đa 12 dòng ảnh AI mỗi bài. Nếu AI lỗi/gián đoạn, bài không tự đăng; kiểm tra kết quả trước khi thử lại.'],
 ['Tài khoản','Bài chờ đăng không cần tài khoản đích ngay. Với bài có lịch, lưu tài khoản mặc định cho từng nền tảng trên hệ thống trước khi nhập.'],
 ['File cũ','Mẫu v2 vẫn được nhận: không AI, dùng chung ảnh cho các kênh. Giờ đăng trống vẫn chuyển thành Chờ đăng theo quy tắc mới.'],
 ],[28,125])),
 ('Danh_muc', sheet([
 ['Kênh đăng','Tỉ lệ AI','Tỉ lệ gốc'],
 ['Facebook','1:1','Gốc'],
 ['Instagram','4:5',''],
 ['Zalo OA','3:4',''],
 ['Facebook, Instagram','9:16',''],
 ['Facebook, Zalo OA','16:9',''],
 ['Instagram, Zalo OA','',''],
 ['Facebook, Instagram, Zalo OA','',''],
 ],[40,18,18]))]

OUTPUT.parent.mkdir(parents=True,exist_ok=True)
with ZipFile(OUTPUT,'w',ZIP_DEFLATED) as z:
 z.writestr('[Content_Types].xml','<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'+''.join(f'<Override PartName="/xl/worksheets/sheet{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' for i in range(1,len(sheets)+1))+'</Types>')
 z.writestr('_rels/.rels','<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>')
 z.writestr('xl/workbook.xml',f'<workbook xmlns="{NS}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>'+''.join(f'<sheet name="{name}" sheetId="{i}" r:id="rId{i}" state="{'hidden' if name == 'Danh_muc' else 'visible'}"/>' for i,(name,_) in enumerate(sheets,1))+'</sheets><definedNames><definedName name="KenhDang">Danh_muc!$A$2:$A$8</definedName><definedName name="TiLeAI">Danh_muc!$B$2:$B$6</definedName><definedName name="TiLeGoc">Danh_muc!$C$2</definedName><definedName name="MaBai">Bai_dang!$A$2:$A$501</definedName></definedNames></workbook>')
 z.writestr('xl/_rels/workbook.xml.rels','<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+''.join(f'<Relationship Id="rId{i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet{i}.xml"/>' for i in range(1,len(sheets)+1))+'<Relationship Id="styles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>')
 z.writestr('xl/styles.xml',f'<styleSheet xmlns="{NS}"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts><fills count="4"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF2454D6"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFE8F0FE"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="3"><xf fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf><xf fontId="0" fillId="3" borderId="0" xfId="0" applyFill="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>')
 for i,(_,xml) in enumerate(sheets,1): z.writestr(f'xl/worksheets/sheet{i}.xml',xml)
print(OUTPUT)
