git 
turn off the swap
```sh
sudo swapoff /swap.img
```

set the new swap size
```sh
sudo fallocate -l <SIZE>G /swap.img
```

create the swap on the file
```sh
sudo mkswap /swap.img
```

turn the swap on
```sh
sudo swapon /swap.img
```
