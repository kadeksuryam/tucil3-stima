/* Implementasi map */
var mapInfo
var adjMatrix
function loadFile() {
  var input, file, fr;

  if (typeof window.FileReader !== 'function') {
    alert("The file API isn't supported on this browser yet.");
    return;
  }

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

  function receivedText(e) {
    let lines = e.target.result;
    console.log(lines);
    mapInfo = JSON.parse(lines.toString()); 
    //console.log(newArr);
    var map = new ol.Map({
      target: 'map',
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM()
        })
      ],
      view: new ol.View({
        center: ol.proj.fromLonLat([1333508158425.6594, -772229.4153715803]),
        zoom: 7
      })
    });
    map.on('click', function(e){
      console.log(e.coordinate);
    })
  }
}


/* Priority Queue, Data Struktur */
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

/* Implementasi A* Algorithm */
/* fScore(n) = gScore(n) + hScore(n) */
/* gScore(n) adalah jarak dari node awal ke node n */
/* hScore(n) adalah jarak euclidean dari node node n ke tujuan */

function reconstruct_path(cameFrom, currNode){
  total_path = [currNode];
  while(cameFrom.has(currNode)){
    currNode = cameFrom.get(currNode);
    total_path.unshift(currNode);
  }
  return total_path;
}

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
    if(currNode.id == goal)
      return reconstruct_path(cameFrom, currNode.id);

    currNode.dequeue();
    for(let i=0;i<adjMatrix[parseInt(start)];i++){
      if(adjMatrix[i]) {
        let neighbor = (i+1).toString();
        tentative_gScore = gScore.get(currNode.id) + euclideanDist(currNode.id, neighbor);
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