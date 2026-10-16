# Docker deployment

## Tunnel và network dùng chung

Tunnel được triển khai độc lập từ bộ `hoatheomua-gateway/.docker/tunnel` trong workspace.
Xem [hướng dẫn chuyển đổi](../../hoatheomua-gateway/.docker/tunnel/README.md) để copy bộ này
lên server, bootstrap network và chuyển từng connector trước khi deploy thay đổi app.
Đường dẫn trên dùng checkout các repo cạnh nhau; nếu clone riêng, tìm thư mục
`.docker/tunnel/README.md` trong repo `TaskCoper/hoatheomua-gateway`.

`.docker/compose.yaml` dành cho CI/CD sử dụng network external có sẵn.
Compose local `docker-compose.yml` và các overlay vẫn giữ cách chạy local hiện tại.
