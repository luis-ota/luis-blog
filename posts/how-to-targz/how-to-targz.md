---
date: 2025-02-18
title: how to use tar to compress files
description: How to use tar with examples, and more
img: https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ10Be4J3ahQau5SRo8G44OCFtOblXGz1mkRQ&s
---


command:
```sh
tar -czvf filename.tar.gz /path/to/dir1/*
```
or
```sh
tar -czvf filename.tar.gz /path/to/dir1 dir2 file1 file2
```

to list the content of a compressed file
```sh
tar -ztvf filename.tar.gz
```


to extract
```sh
tar -xvf file.tar.gz  
```
or
```sh
tar -xzvf file.tar.gz  
```

| tar command option | Description                                                         |
| ------------------ | ------------------------------------------------------------------- |
| -c                 | Create a new archive                                                |
| -x                 | Extract files from an archive                                       |
| -t                 | List the contents of an archive                                     |
| -v                 | Verbose output                                                      |
| -f file.tar.gz     | Use archive file                                                    |
| -C DIR             | Change to DIR before performing any operations                      |
| -z                 | Filter the archive through gzip i.e. compress or decompress archive |
