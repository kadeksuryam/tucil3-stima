/* Essential Variable  */
let nodeInfo = []; //Array of Object, berisi informasi detail setiap node
let adjMatrix = []; //Matrix nxn, berisi integer 0/1
let pilAwalNode; //string, pilihan node awal
let pilAkhirNode; //string, pilihan node akhir
let graphWeight = []; // matrix nxn, jarak suatu node dengan tetangga-tetanggannya
let myMap;

let pathlines = [];
let markers = [];

window.onload = function()
{
  document.getElementsByClassName('map')[0].style.display = 'block';
  document.getElementsByClassName('pil-node')[0].style.display = 'block';

  myMap = L.map('map').setView([-6.819134, 107.61065], 15);
  myMap.doubleClickZoom.disable();

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(myMap);

  /* Add node on double click */
  myMap.on('dblclick', function(e)
  {
    let marker = L.marker(e.latlng, {draggable: 'true'});
    
    let newNode = {"id": (nodeInfo.length+1).toString(), "nama": "", "lat": e.latlng.lat, "lon": e.latlng.lng};
    marker.bindPopup(`${newNode.id}`);
    marker.id = newNode.id;
    myMap.addLayer(marker);
    
    marker.on('dragend', function()
    {
      console.log("New lat len is", marker.getLatLng());
      nodeInfo[marker.id-1].lat = marker.getLatLng().lat;
      nodeInfo[marker.id-1].lng = marker.getLatLng().lng;
      console.log("New marker is", nodeInfo[marker.id-1]);
      drawPath();
      handlePathTable();
    });

    markers.push(marker);
    nodeInfo.push(newNode);

    let newRow = [];
    let newWeight = [];

    for(let i = 0; i < adjMatrix.length; i++)
    {
      adjMatrix[i].push(0);
      graphWeight[i].push(1);
      newRow.push(0);
      newWeight.push(1);
    }
    newRow.push(1);
    newWeight.push(0);
    adjMatrix.push(newRow);
    graphWeight.push(newWeight);

    handleNodePilForm();
    return e;
  })

}

/* Subroutine untuk load testcase, format file : JSON */
function loadFile() {
  let input, file, fr;

  /* Beberapa browser mungkin tidak mendukung FileReader API  */
  if (typeof window.FileReader !== 'function') {
    alert("The file API isn't supported on this browser yet.");
    return;
  }

  input = document.getElementById('fileinput');
  if (!input) {
    /* Tidak ditemukannya objek element 'fileinput' pada DOM Tree */
    alert("Um, couldn't find the fileinput element.");
  }
  else if (!input.files) {
    /* Browser tidak support `files` property */
    alert("This browser doesn't seem to support the `files` property of file inputs.");
  }
  else if (!input.files[0]) {
    /* Jika user mengklik load button sebelum memilih testcase */
    alert("Please select a file before clicking 'Load'");
  }
  else {
    /* Baca file dan proses callback saat file diload pada fungsi recievedText */
    file = input.files[0];
    fr = new FileReader();
    fr.onload = receivedText;
    fr.readAsText(file);
  }

  /* Callback loaded JSON */
  function receivedText(e) {
    let lines = e.target.result;
    //console.log(lines);
    /* Simpan data testcase di variabel global nodeInfo dan adjMatrix */
    
    /* Inisialisasi Variabel Essential */
    mapInfo = JSON.parse(lines.toString()); 
    nodeInfo = mapInfo.nodeInfo;
    adjMatrix = mapInfo.adjMatrix;
    graphWeight = mapInfo.weight;
  
    /* Ketika sudah ada map yang terload, tidak perlu di load lagi  */
    if(!(document.getElementById('map').childNodes.length)){
      document.getElementsByClassName('map')[0].style.display = 'block';
      document.getElementsByClassName('pil-node')[0].style.display = 'block';
      document.getElementsByClassName('pil-awal')[0].innerHTML = '';
      document.getElementsByClassName('pil-akhir')[0].innerHTML = '';
      document.getElementsByClassName('path')[0].innerHTML = '';
    }

    /* Inisialisasi map (node-node pada lan lon berkaitan ditandai) */
    initMap();

    /* handle node form */
    handleNodePilForm();

    /* handle path table */
    handlePathTable(); 

    /* draw paths */
    drawPath();
  }
}

/* Subroutine untuk save data yang ditampilkan ke file json baru */
function saveFile()
{
  console.log("HUHI");
  let saveObject = {nodeInfo: nodeInfo, adjMatrix: adjMatrix, weight: graphWeight};

  let dataHref = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(saveObject)); 
  let downloader = document.createElement('a');

  downloader.setAttribute("href", dataHref);
  downloader.setAttribute("download", "map.json");
  downloader.click();
  downloader.remove();
}

/* Subroutine untuk inisialisasi map */
function initMap(){
  for(let i = 0; i < markers.length; i++)
  {
    myMap.removeLayer(markers[i]);
  }
  markers = [];

  myMap.flyTo([parseFloat(nodeInfo[0].lat), parseFloat(nodeInfo[0].lon)], 15);

  // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //   attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  // }).addTo(myMap);

  let i = 1;
  nodeInfo.forEach(function(info) {
    let marker = L.marker([parseFloat(info.lat), parseFloat(info.lon)], {draggable: 'true'});
    marker.id = i;
    i++;
    marker.bindPopup(`${info.id}`);
    myMap.addLayer(marker);

    marker.on('dragend', function()
    {
      console.log("New lat len is", marker.getLatLng());
      nodeInfo[marker.id-1].lat = marker.getLatLng().lat;
      nodeInfo[marker.id-1].lng = marker.getLatLng().lng;
      console.log("New marker is", nodeInfo[marker.id]);
      drawPath();
      handlePathTable();
    });

    markers.push(marker);
  }); 
  

  /*
  L.marker([-6.927145, 107.603657]).addTo(myMap)
    .bindPopup('Node Awal')
    .openPopup(); */
  function lngLatArrayToLatLng(lngLatArray) {
    return lngLatArray.map(lngLatToLatLng);
  }

  function lngLatToLatLng(lngLat) {
    return [lngLat[1], lngLat[0]];
  }
}

/* Subroutine untuk menggambar path */
function drawPath(){
  console.log("call");
  for(let i = 0; i < pathlines.length; i++)
  {
    myMap.removeLayer(pathlines[i]);
  }
  pathlines = [];

  for(let i=0; i<adjMatrix.length; i++)
  {
    for(let j=0; j<i; j++)
    {
      if(adjMatrix[i][j] == 1)
      {
        let latlons = [
          markers[i].getLatLng(),
          markers[j].getLatLng()
        ];

        let line = L.polyline(latlons, {color: 'teal'});
        pathlines.push(line);
        myMap.addLayer(line);
      }
    }
  }
}

function handlePathTable()
{
  let tableContents = document.getElementById('pathTableContents');
  tableContents.innerHTML = '';
  let count = 1;

  for(let i=0; i<adjMatrix.length; i++)
  {
    for(let j=0; j<i; j++)
    {
      if(adjMatrix[i][j] == 1)
      {
        tableContents.innerHTML += 
        `
        <tr>
          <th scope="row">${count}</th>
          <td>${j+1}-${i+1}</td>
          <td>${haversineDistAtoB(j, i).toFixed(3)} km</td>
          <td>${graphWeight[i][j]}</td>
        </tr>
        `;
        count++;
      }
    }
  }
}

/* Subroutine untuk form pemilihan node awal-akhir */
function handleNodePilForm(){
  let newPilStart = document.getElementsByClassName('path-awal')[0];
  let newPillEnd = document.getElementsByClassName('path-akhir')[0];

  newPilStart.innerHTML = '';
  newPillEnd.innerHTML = '';
  // newPilStart.innerHTML += `<option selected="">New Path Start</option>`
  // newPillEnd.innerHTML += '<option selected="">New Path End</option>'
  for(let i=1;i<=adjMatrix.length;i++){
    newPilStart.innerHTML += `<option value="${i}">${i.toString()}</option>`
    newPillEnd.innerHTML += `<option value="${i}">${i.toString()}</option>`
  } 

  let pilAwal = document.getElementsByClassName('pil-awal')[0];
  let pilAkhir = document.getElementsByClassName('pil-akhir')[0];
  // pilAwal.innerHTML += `<option selected="">Pilih Node Awal...</option>`
  // pilAkhir.innerHTML += '<option selected="">Pilih Node Akhir...</option>'
  pilAwal.innerHTML = '';
  pilAkhir.innerHTML = '';
  for(let i=1;i<=adjMatrix.length;i++){
    pilAwal.innerHTML += `<option value="${i}">${i.toString()}</option>`
    pilAkhir.innerHTML += `<option value="${i}">${i.toString()}</option>`
  }
}

/* Subroutine untuk handling submission form pemilihan node awal-akhir */
function handleSubmitPilForm(){
  pilAwalNode = document.getElementsByClassName('pil-awal')[0].value;
  pilAkhirNode = document.getElementsByClassName('pil-akhir')[0].value;

  //panggil algoritma A* dan gambarkan lintasannya di map
  path = A_Star(pilAwalNode, pilAkhirNode, haversineDist);
  
  //gambarkan pada peta


  //tampilan secara tertulis
  elmtPath = document.getElementsByClassName('path')[0];
  if(!(path.length)) elmtPath.innerHTML = '<p>Tidak ditemukannya Path</p>';
  else{
    let ansPath = "Path: ";
    for(let i=0;i<path[0].length;i++){
      if(i != path[0].length-1) ansPath += path[0][i] + ' -> ';
      else ansPath += path[0][i] + '.';
    }
    elmtPath.innerHTML = `<p>${ansPath}</p>`;  
    elmtPath.innerHTML += `<p>Jaraknya : ${path[1]} km`
  }
}

/* =========================== MAIN ALGORITHM ================================ */
/* Implementasi A* Algorithm */
/* fScore(n) = gScore(n) + hScore(n) */
/* gScore(n) adalah jarak dari node awal ke node n */
/* hScore(n) adalah jarak euclidean dari node node n ke tujuan */

//tc1, rute terpendeknya harusnya : 1 -> 5 -> 4

/* Konstruksi path yang ditemukan */
/* cameForm : Map, currNode : string */
function reconstruct_path(cameFrom, currNode, gScore){
 // console.log(cameFrom);
 // console.log('path is found');
  jarak = gScore.get(currNode);
  total_path = [currNode];
  while(cameFrom.has(currNode)){
    currNode = cameFrom.get(currNode);
    total_path.unshift(currNode);
  }
  return [total_path, jarak];
}

/* start, goal : string, h (haversineDist) : function */
function A_Star(start, goal, h){
  // misalkan jarak INF (tak hingga) bernilai 10^9 + 7 km
  const INF = 1000000007;

  /* openSet adalah priority queue untuk menampung node-node yang aktif saat pencarian */
  openSet = new PriorityQueue();

  /* cameFrom[n] adalah node yang terhubung dengan n dengan jarak paling kecil dari node awal */
  cameFrom = new Map();

  /* gscore[n] adalah biaya termurah dari node awal ke node n */
  gScore = new Map();

  /* jarak semua node dari node awal bernilai tak hingga  */
  for(let i=0;i<adjMatrix.length;i++) gScore.set((i+1).toString(), INF);
  gScore.set(start, 0);

  /* fScore[n] adalah biaya yang dihitung dengan rumus gScore[n] + hScore[n], dengan h adalah fungsi heuristik */
  fScore = new Map();
  for(let i=0;i<adjMatrix.length;i++) fScore.set((i+1).toString(), INF);
  fScore.set(start, h(start));

  //masukkan node awal ke queue
  //setiap node berbentuk objek Node {"namaNode", "priority"}
  //priority adalah fScore
  openSet.enqueue(new Node(start, fScore.get(start)));
  
  while(openSet.values.length !== 0){
    currNode = openSet.values[0];

    /* Ditemukannya path */
    if(currNode.value == goal)
      return reconstruct_path(cameFrom, currNode.value, gScore);

    openSet.dequeue();

    /* untuk setiap tetangga dari node yang dievaluasi sekarang */
    for(let i=0;i<adjMatrix[parseInt(currNode.value)-1].length;i++){
      if(adjMatrix[parseInt(currNode.value)-1][i]) {
        let neighbor = (i+1).toString();
        
        /* jika cost dari node yang dievaluasi ke tetangganya lebih kecil daripada gScorenya */
        /* ganti keterhubungan node tetanngga dengan node sekarang */
        tentative_gScore = gScore.get(currNode.value) + graphWeight[parseInt(currNode.value)-1][parseInt(neighbor)-1];
        if(tentative_gScore < gScore.get(neighbor)){
          cameFrom.set(neighbor, currNode.value);
          gScore.set(neighbor, tentative_gScore);
          fScore.set(neighbor, gScore.get(neighbor)+h(neighbor));
          let isInOpenSet = function(node){
            openSet.values.forEach(element => {
              if(element.value === node) return true;
            });
            return false;
          }
          //mungkin akan ada duplikat, tapi nilai fScore setiap node dijamin terganti
         openSet.enqueue(new Node(neighbor, fScore.get(neighbor)));
        }  
      }
    }
  }
  /* tidak ditemukannya path */
  return [];
}


function haversineDist(currNode){

  console.log(nodeInfo)

  let lat2 = nodeInfo[parseInt(pilAkhirNode)-1].lat; 
  let lon2 = nodeInfo[parseInt(pilAkhirNode)-1].lon; 
  let lat1 = nodeInfo[parseInt(currNode)-1].lat; 
  let lon1 = nodeInfo[parseInt(currNode)-1].lon; 
  
  var R = 6371; // km 

  var x1 = lat2-lat1;
  var dLat = x1* Math.PI / 180;  
  var x2 = lon2-lon1;
  var dLon = x2* Math.PI / 180;  
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
                  Math.cos(lat1* Math.PI / 180) * Math.cos(lat2* Math.PI / 180) * 
                  Math.sin(dLon/2) * Math.sin(dLon/2);  
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; 
  
  //d masih dalam km
  return d;
}

function haversineDistAtoB(firstID, secondID){

  console.log(nodeInfo)

  let lat2 = nodeInfo[firstID].lat; 
  let lon2 = nodeInfo[firstID].lon; 
  let lat1 = nodeInfo[secondID].lat; 
  let lon1 = nodeInfo[secondID].lon; 
  
  var R = 6371; // km 

  var x1 = lat2-lat1;
  var dLat = x1* Math.PI / 180;  
  var x2 = lon2-lon1;
  var dLon = x2* Math.PI / 180;  
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
                  Math.cos(lat1* Math.PI / 180) * Math.cos(lat2* Math.PI / 180) * 
                  Math.sin(dLon/2) * Math.sin(dLon/2);  
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; 
  
  //d masih dalam km
  return d;
}


/* Data Struktur, Priority Queue */
class Node{
  constructor(value, priority){
      this.value = value
      this.priority = priority
  }
}

class PriorityQueue{
  
  constructor(){
      this.values = []
  }

  //helper method that swaps the values and two indexes of an array
  swap(index1, index2){
      let temp = this.values[index1];
      this.values[index1] = this.values[index2];
      this.values[index2] = temp;
      return this.values;
  }
  //helper methods that bubbles up values from end
  bubbleUp(){
      //get index of inserted element
      let index = this.values.length - 1
      //loop while index is not 0 or element no loger needs to bubble
      while(index > 0){
          //get parent index via formula
          let parentIndex = Math.floor((index - 1)/2);
          //if values is greater than parent, swap the two
          if(this.values[parentIndex].priority > this.values[index].priority){
              //swap with helper method
              this.swap(index, parentIndex);
              //change current index to parent index
              index = parentIndex;
          } else{
              break;
          }
      }
      return 0;
  }
  // method that pushes new value onto the end and calls the bubble helper
  enqueue(value){
      this.values.push(value)
      //calculate parent, if parent is greater swap
      //while loop or recurse
      this.bubbleUp();
      return this.values
  }

  bubbleDown(){
      let parentIndex = 0;
      const length = this.values.length;
      const elementPriority = this.values[0].priority;
      //loop breaks if no swaps are needed
      while (true){
          //get indexes of child elements by following formula
          let leftChildIndex = (2 * parentIndex) + 1;
          let rightChildIndex = (2 * parentIndex) + 2;
          let leftChildPriority, rightChildPriority;
          let indexToSwap = null;
          // if left child exists, and is greater than the element, plan to swap with the left child index
          if(leftChildIndex < length){
              leftChildPriority = this.values[leftChildIndex].priority
              if(leftChildPriority < elementPriority){
                  indexToSwap = leftChildIndex;
              }
          }
          //if right child exists
          if(rightChildIndex < length){
              rightChildPriority = this.values[rightChildIndex].priority

              if(
                  //if right child is greater than element and there are no plans to swap
                  (rightChildPriority < elementPriority && indexToSwap === null) ||
                  //OR if right child is greater than left child and there ARE plans to swap
                  (rightChildPriority < leftChildPriority && indexToSwap !== null))
              {
                  //plan to swap with the right child
                  indexToSwap = rightChildIndex
              }
          }
          //if there are no plans to swap, break out of the loop
          if(indexToSwap === null){
              break;
          } 
          //swap with planned element
          this.swap(parentIndex, indexToSwap);
          //starting index is now index that we swapped with
          parentIndex = indexToSwap;
      }  
  }

  dequeue(){
      //swap first and last element
      this.swap(0, this.values.length - 1);
      //pop max value off of values
      let poppedNode = this.values.pop();
      //re-adjust heap if length is greater than 1
      if(this.values.length > 1){
          this.bubbleDown();
      }
      
      return poppedNode;
  }
}

