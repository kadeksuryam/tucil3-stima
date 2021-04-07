# Tugas Kecil Strategi Algoritma 3
> Algoritma A*
Deployed App : https://kadeksuryam.github.io/tucil3-stima/

## Table of contents
* [General info](#general-info)
* [Screenshots](#screenshots)
* [Technologies](#technologies)
* [Setup](#setup)
* [Features](#features)
* [Status](#status)
* [Inspiration](#inspiration)
* [Contact](#contact)

## General info
Menampilkan peta untuk ditambahkan marker(lokasi/node) dan path(jalan/edge) yang kemudian membentuk graf yang dapat ditraversal dengan algoritma A*

Dapat menerima input file json yang berisi data node, matriks ketetetanggaan, dan matriks bobot

## Screenshots
![Screenshot Aplikasi](https://gyazo.com/ba0e0aa35aecd2ae2abd3b0158b27aee)

## Technologies
* Leaflet.js - v1.7.1
* Bootstrap - v.4.0.0
* jQuery - v.3.6.0
* Popper JS - v.1.12.9

## Setup
Setup hanya memerlukan browser (Google Chrome, Firefox, Safari, Edge) dan membuka index.html

## Usage Examples
Format file json yang digunakan adalah
{
    "nodeInfo": [
        {"id": 1, "nama": "", "lat": -6.90, "lon": 107.597},
        {"id": 2, "nama": "", "lat": -6.95, "lon": 107.597},
        {"id": 3, "nama": "", "lat": -7.00, "lon": 107.597},
        ]
    "adjMatrix": [
        [1, 0, 0],
        [0, 1, 1],
        [0, 1, 1]
    ],
    "weight": [
        [0, 0, 0],
        [0, 0, 0.3],
        [0, 0.3, 0]
    ]
}

id untuk node dimulai dari 1
weight menunjukkan jarak antara dua node dalam km

## Features
List Fitur
* Tambahkan node dengan double-click
* Tambahkan path dengan menu di sebelah kanan
* Pindahkan posisi node dengan drag-and-drop
* Cari rute terpendek antara dua node dengan algoritma A*


## Status
Project is: finished

## Authors
I Gede Govindabhakta (13519139) dan Kadek Surya Mahardika (13519165)
