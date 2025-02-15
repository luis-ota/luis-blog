Create a docker-compose.yml with

```sh
services:
  windows:
    image: dockurr/windows
    container_name: windows
    devices:
      - /dev/kvm
      - /dev/net/tun
    cap_add:
      - NET_ADMIN
    ports:
      - 8006:8006
      - 3389:3389/tcp
      - 3389:3389/udp
    #restart: always
    stop_grace_period: 2m
    environment:
      VERSION: "10l"
      RAM_SIZE: "3GB"
      CPU_CORES: "4"
      DISK_SIZE: "30GB"
    volumes:
    - ./data:/storage/shared
```

Configure the system specs at

```sh
VERSION: "10l"
      RAM_SIZE: "3GB"
      CPU_CORES: "4"
      DISK_SIZE: "30GB"
```

Run
```sh
docker compose up
```

access via RDP at `0.0.0.0` or using the browser accessing `localhost:8006/`

reference:
- [dockur/windows](https://github.com/dockur/windows)
- [dockur/windows-arm](https://github.com/dockur/windows-arm/)

