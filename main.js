/* Essential Variable  */
let nodeInfo; //Array of Object, berisi informasi detail setiap node
let adjMatrix; //Matrix nxn, berisi integer 0/1
let pilAwalNode; //string, pilihan node awal
let pilAkhirNode; //string, pilihan node akhir

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
  
    if(!(document.getElementById('map').childNodes.length)){
      document.getElementsByClassName('map')[0].style.display = 'block';
      document.getElementsByClassName('pil-node')[0].style.display = 'block';
      document.getElementsByClassName('pil-awal')[0].innerHTML = '';
      document.getElementsByClassName('pil-akhir')[0].innerHTML = '';
      /* Inisialisasi map (node-node pada lan lon berkaitan ditandai) */
      initMap();

      /* handle node form */
      handleNodePilForm();
    }
  }
}

/* Map routine */
function initMap(){
  let map = new ol.Map({
    target: 'map',
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM()
      })
    ],
    view: new ol.View({
      center: ol.proj.fromLonLat([37.41, 8.82]),
      zoom: 4
    })
  });
  map.on('click', function(e){
    console.log(e.coordinate);
  })
}

function drawPath(){

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
}

/* =========================== MAIN ALGORITHM ================================ */
/* Implementasi A* Algorithm */
/* fScore(n) = gScore(n) + hScore(n) */
/* gScore(n) adalah jarak dari node awal ke node n */
/* hScore(n) adalah jarak euclidean dari node node n ke tujuan */

//tc1, rute terpendeknya harusnya : 1 -> 5 -> 4

/* cameForm : Map, currNode : string */
function reconstruct_path(cameFrom, currNode){
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
  cameFrom = new Map(String, String);

  // For node n, gScore[n] is the cost of the cheapest path from start to n currently known.
  gScore = new Map(String, Number);
  //Initialize all gScore for all node to be Infinity
  for(let i=0;i<adjMatrix.length;i++) gScore.set((i+1).toString(), INF);
  gScore.set(start, 0);

  // For node n, fScore[n] := gScore[n] + h(n). fScore[n] represents our current best guess as to
  // how short a path from start to finish can be if it goes through n.
  fScore = new Map(String, Number);
  fScore.set(start, h(start));

  //masukkan node awal ke queue
  //setiap node berbentuk objek Node {"namaNode", "priority"}
  //priority adalah fScore
  openSet.enqueue(new Node(start, fScore.get(start)));
  
  while(openSet.values.length !== 0){
    // This operation can occur in O(1) time if openSet is a min-heap or a priority queue
    currNode = openSet.values[0];
    if(currNode.value == goal)
      return reconstruct_path(cameFrom, currNode.value);

    openSet.dequeue();
    for(let i=0;i<adjMatrix[parseInt(start)];i++){
      if(adjMatrix[parseInt(start)][i]) {
        let neighbor = (i+1).toString();
        tentative_gScore = gScore.get(currNode.value) + haversineDist(currNode.value, neighbor);
        if(tentative_gScore < gScore.get(neighbor)){
          cameFrom.set(neighbor, currNode.id);
          gScore.set(neighbor, tentative_gScore);
          fScore.set(neighbor, gscore.get(neighbor)+h(neighbor));
          let isInOpenSet = function(node){
            openSet.values.forEach(element => {
              if(element.value === node) return true;
            });
            return false;
          }
          if(!(isInOpenSet(neighbor))) openSet.enqueue(neighbor);
        }  
      }
    }
  }
  return -1;
}


function haversineDist(currNode){
 Number.prototype.toRad = function() {
    return this * Math.PI / 180;
 }
 
  let lat2 = nodeInfo[parseInt(pilAkhirNode)-1].lat; 
  let lon2 = nodeInfo[parseInt(pilAkhirNode)-1].lon; 
  let lat1 = nodeInfo[parseInt(currNode)-1].lat; 
  let lon1 = nodeInfo[parseInt(currNode)-1].lon; 
  
  var R = 6371; // km 

  var x1 = lat2-lat1;
  var dLat = x1.toRad();  
  var x2 = lon2-lon1;
  var dLon = x2.toRad();  
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
                  Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * 
                  Math.sin(dLon/2) * Math.sin(dLon/2);  
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; 
  
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
