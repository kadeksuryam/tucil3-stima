/* Essential Variable  */
let nodeInfo; //Array of Object, berisi informasi detail setiap node
let adjMatrix; //Matrix nxn, berisi integer 0/1
let pilAwalNode; //string, pilihan node awal
let pilAkhirNode; //string, pilihan node akhir
let graphWeight;

function loadFile() {
  let input, file, fr;

  /* Load testcase (JSON) dengan FileReader  */
  if (typeof window.FileReader !== 'function') {
    alert("The file API isn't supported on this browser yet.");
    return;
  }

  /* Cek kondisi input file kontainer */
  input = document.getElementById('fileinput');
  if (!input) {
    alert("Um, couldn't find the fileinput element.");
  }
  else if (!input.files) {
    alert("This browser doesn't seem to support the `files` property of file inputs.");
  }
  else if (!input.files[0]) {
    alert("Please select a file before clicking 'Load'");
  }
  else {
    file = input.files[0];
    fr = new FileReader();
    fr.onload = receivedText;
    fr.readAsText(file);
  }

  /* Callback loaded JSON */
  function receivedText(e) {
    let lines = e.target.result;
    console.log(lines);
    /* Simpan data testcase di variabel global nodeInfo dan adjMatrix */
    mapInfo = JSON.parse(lines.toString()); 
    nodeInfo = mapInfo.nodeInfo;
    adjMatrix = mapInfo.adjMatrix;
    graphWeight = mapInfo.weight;
  
    if(!(document.getElementById('map').childNodes.length)){
      document.getElementsByClassName('map')[0].style.display = 'block';
      document.getElementsByClassName('pil-node')[0].style.display = 'block';
      document.getElementsByClassName('pil-awal')[0].innerHTML = '';
      document.getElementsByClassName('pil-akhir')[0].innerHTML = '';
      document.getElementsByClassName('path')[0].innerHTML = '';
      /* Inisialisasi map (node-node pada lan lon berkaitan ditandai) */
      initMap();

      /* handle node form */
      handleNodePilForm();
    }
  }
}

/* Map routine */
function initMap(){
  let myMap = L.map('map').setView(new L.LatLng(parseFloat(nodeInfo[0].lat), parseFloat(nodeInfo[0].lon)), 15);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(myMap);

  nodeInfo.forEach(function(info) {
    L.marker([parseFloat(info.lat), parseFloat(info.lon)]).addTo(myMap).bindPopup(`${info.id}`);
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

function drawPath(path){

}


/* Node form routine */
function handleNodePilForm(){
  let pilAwal = document.getElementsByClassName('pil-awal')[0];
  let pilAkhir = document.getElementsByClassName('pil-akhir')[0];
  pilAwal.innerHTML += `<option selected="">Pilih Node Awal...</option>`
  pilAkhir.innerHTML += '<option selected="">Pilih Node Akhir...</option>'
  for(let i=1;i<=adjMatrix.length;i++){
    pilAwal.innerHTML += `<option value="${i}">${i.toString()}</option>`
    pilAkhir.innerHTML += `<option value="${i}">${i.toString()}</option>`
  } 
}

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
    for(let i=0;i<path.length;i++){
      if(i != path.length-1) ansPath += path[i] + ' -> ';
      else ansPath += path[i] + '.';
    }
    elmtPath.innerHTML = `<p>${ansPath}</p>`;  
  }
}

/* =========================== MAIN ALGORITHM ================================ */
/* Implementasi A* Algorithm */
/* fScore(n) = gScore(n) + hScore(n) */
/* gScore(n) adalah jarak dari node awal ke node n */
/* hScore(n) adalah jarak euclidean dari node node n ke tujuan */

//tc1, rute terpendeknya harusnya : 1 -> 5 -> 4

/* cameForm : Map, currNode : string */
function reconstruct_path(cameFrom, currNode){
  console.log(cameFrom);
  console.log('path is found');
  total_path = [currNode];
  while(cameFrom.has(currNode)){
    currNode = cameFrom.get(currNode);
    total_path.unshift(currNode);
  }
  return total_path;
}

/* start, goal : string, h : function */
function A_Star(start, goal, h){
  const INF = 1000000007;
  openSet = new PriorityQueue();

  // For node n, cameFrom[n] is the node immediately preceding it on the cheapest path from start
  // to n currently known.
  cameFrom = new Map();

  // For node n, gScore[n] is the cost of the cheapest path from start to n currently known.
  gScore = new Map();
  //Initialize all gScore for all node to be Infinity
  for(let i=0;i<adjMatrix.length;i++) gScore.set((i+1).toString(), INF);
  gScore.set(start, 0);

  // For node n, fScore[n] := gScore[n] + h(n). fScore[n] represents our current best guess as to
  // how short a path from start to finish can be if it goes through n.
  fScore = new Map();
  for(let i=0;i<adjMatrix.length;i++) fScore.set((i+1).toString(), INF);
  fScore.set(start, h(start));

  //masukkan node awal ke queue
  //setiap node berbentuk objek Node {"namaNode", "priority"}
  //priority adalah fScore
  openSet.enqueue(new Node(start, fScore.get(start)));
  
  while(openSet.values.length !== 0){
    // This operation can occur in O(1) time if openSet is a min-heap or a priority queue
    //console.log('tes');
    currNode = openSet.values[0];
    //console.log(currNode);
    if(currNode.value == goal)
      return reconstruct_path(cameFrom, currNode.value);

    openSet.dequeue();
    for(let i=0;i<adjMatrix[parseInt(currNode.value)-1].length;i++){
      //console.log('tes2');
      if(adjMatrix[parseInt(currNode.value)-1][i]) {
        //console.log('tes3');
        let neighbor = (i+1).toString();
        //console.log( currNode.value, neighbor);
        tentative_gScore = gScore.get(currNode.value) + graphWeight[parseInt(currNode.value)-1][parseInt(neighbor)-1];
        //console.log('tentative_gScore: ', tentative_gScore, gScore.get(neighbor));
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
          if(!(isInOpenSet(neighbor))) openSet.enqueue(new Node(neighbor, fScore.get(neighbor)));
        }  
      }
    }
  }
  //console.log(fScore);
  //console.log(gScore);
  return [];
}


function haversineDist(currNode){

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
