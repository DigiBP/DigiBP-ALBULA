const video = document.getElementById('video')
var setUp = true
var url="https://docs.google.com/spreadsheets/d/1hZ8hSMVrYOTRgKt57JnVF_cJR7W986TOV_TzKLGW990/edit?usp=sharing";
var labels = []
var faceMatcher;
function showInfo(data, tabletop) {
  for (i = 0; i<data.length-1; i++){
    label = data[i]["First Name"] + " "+ data[i]["Last Name"]
    labels.push(label)
    }
    console.log("fetching new data...")
    if (setUp){
      startVideo()
      setUp = false
    }
  }
// URL of the public spreadsheet
Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('./models'),
  faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
  Tabletop.init({key: url, callback: showInfo, simpleSheet: true})
])

function init() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
  /* var url="https://docs.google.com/spreadsheets/d/1hZ8hSMVrYOTRgKt57JnVF_cJR7W986TOV_TzKLGW990/edit?usp=sharing";
  var labels = []
  Tabletop.init( { key: url,
                    callback: showInfo,
                    simpleSheet: true } ) */
                    
  /* function showInfo(data, tabletop) {
  for (i = 0; i<data.length-1; i++){
    label = data[i]["First Name"] + " "+ data[i]["Last Name"]
    labels.push(label)
    }
    startVideo(labels)
  } */
}
async function startVideo() {
  const labeledFaceDescriptors = await loadLabeledImages(labels);
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
 /*  const mainLogic = async _ => {
    const labeledFaceDescriptors = await loadLabeledImages(labels);
    start(labeledFaceDescriptors)
  }
  mainLogic() */
  start(labeledFaceDescriptors)
}
function start(labeledFaceDescriptors) {
  faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
  updateLabels()
  console.log("starting ...")
  video.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(video)
    document.body.append(canvas)
    const displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvas, displaySize)
    setInterval(async () => {
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
    results.forEach((result, i) => {
      const box = resizedDetections[i].detection.box
      const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
      drawBox.draw(canvas)
    })
  },100)
})
}
function loadLabeledImages(labels) {
  //const labels = ['Mara Wallis', 'Maria Pereira', 'Marita Wick', 'Milena Long']
  return Promise.all(
    labels.map(async label => {
      const descriptions = []
      const img = await faceapi.fetchImage(`./dbImages/${label}.jpg`)
      const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
      descriptions.push(detections.descriptor)
      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}
function updateLabels(){
  setInterval(async () => {
  Tabletop.init({key: url, callback: showInfo, simpleSheet: true})
  const labeledFaceDescriptors = await loadLabeledImages(labels);
  faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
  },1000)
}
