let font;
let textColorPicker;
let bgColorPicker;
let textInput;
let saveButton;
let checkbox;
let posterText;
let stories;
let randomizeButton;
let currentStory;
let sizeSlider;
let canvasHeight = 600;
let canvasWidth = 600;
let artistImage;
let notesDiv;
let similarDiv;
let controlsDiv;

let apiEndpointToken = "https://api.artsy.net/api/tokens/xapp_token";
let clientID = "fdb4541864301f4843d9";
let clientSecret = "90e52d7d50e3bcbf452ca3d5a0eb7723";
let xappToken;

async function preload() {
  
    stories = loadStrings("Stories.txt");

}

async function setup() {
    createCanvas(canvasWidth, canvasHeight);
    pixelDensity(4);
    noLoop();
    await fetchToken();
    setupControls();
    setupNotesAndSimilarArtists();
    randomStory();
}

async function fetchToken() {
    let response = await fetch(`${apiEndpointToken}?client_id=${clientID}&client_secret=${clientSecret}`, {
        method: "POST"
    });
    let data = await response.json();
    xappToken = data.token;
}

function setupControls() {
    controlsDiv = createDiv()
    controlsDiv.id("controls");

    createElement('h2', 'Make your own poster').parent(controlsDiv);
    let artistSearchInput = createInput('').attribute('placeholder', 'Enter artist name').parent(controlsDiv);
    let searchButton = createButton('Search').parent(controlsDiv);
    searchButton.mousePressed(() => {
        fetchArtistDataByName(artistSearchInput.value());
    });
    randomizeButton = createButton('New Quote').parent(controlsDiv);
    randomizeButton.mousePressed(() => {
        randomStory();
        redraw();
    });
    checkbox = createCheckbox('Use My Quote', false).parent(controlsDiv);
    textInput = createInput('').attribute('placeholder', 'Your quote here...').parent(controlsDiv);

    let textColorLabel = createSpan("Text Color ");
    textColorLabel.parent(controlsDiv)
    textColorPicker = createColorPicker('#000').parent(controlsDiv);
    let bgColorLabel = createSpan("Bkgd Color ");
    bgColorLabel.parent("controls");
    bgColorPicker = createColorPicker('#E9DAC1').parent(controlsDiv);
    sizeSlider = createSlider(6, 60, 30).parent(controlsDiv);
    saveButton = createButton('Download Poster').parent(controlsDiv);
    saveButton.mousePressed(saveCanvasAsPNG);
    checkbox.changed(() => {
        if (checkbox.checked()) {
            posterText = textInput.value();
        } else {
            randomStory();
        }
        redraw();
    });
    textInput.input(() => {
        if (checkbox.checked()) {
            posterText = textInput.value();
            redraw();
        }
    });
    textColorPicker.changed(redraw);
    bgColorPicker.changed(redraw);
    sizeSlider.changed(redraw);
}

function setupNotesAndSimilarArtists() {
    notesDiv = createDiv().id('notesDiv').parent(controlsDiv);
    notesDiv.style("max-width", "300px");
    notesDiv.style("height", "150px");
    notesDiv.style("border", "none")
}

async function fetchArtistDataByName(artistName) {
    let artistEndpoint = `https://api.artsy.net/api/search?q=${artistName}&size=1`;
    
    try {
        let response = await fetch(artistEndpoint, {
            method: "GET",
            headers: {
                "X-Xapp-Token": xappToken,
                Accept: "application/vnd.artsy-v2+json"
            }
        });
      
        
        let searchData = await response.json();
        let artistSlug
          // Check if there's an artist result
    if (searchData && searchData._embedded.results.length > 0) {
      artistSlug = searchData._embedded.results[0]._links.self.href
        .split("/")
        .pop();
    }
      let artistDataEndpoint = `https://api.artsy.net/api/artists/${artistSlug}`;
      let responseArtistData = await fetch(artistDataEndpoint, {
            method: "GET",
            headers: {
                "X-Xapp-Token": xappToken,
                Accept: "application/vnd.artsy-v2+json"
            }
      });
        let artistData = await responseArtistData.json()
        if (searchData && searchData._embedded.results.length > 0) {
            let imageUrl = searchData._embedded.results[0]._links.thumbnail.href;
            loadArtistImage(imageUrl); // Function to load and display the image
        } else {
            console.log("Artist not found.");
        }
        if (artistData) {
          displayArtist(artistData)
        }
    } catch (error) {
        console.error("Error fetching artist:", error);
    }
}

function loadArtistImage(url) {
    loadImage(url, img => {
        artistImage = img;
        redraw(); // Redraw the canvas to display the new image
    });
}

function draw() {
    if (artistImage) {
        background(artistImage);
    } else {
        background(255); // White background if no image is loaded
    }
    if(bgColorPicker != undefined) {
      console.log(bgColorPicker.color()._array[0]) 
         
      fill(bgColorPicker.color()._array[0]*255,bgColorPicker.color()._array[1]*255, bgColorPicker.color()._array[2]*255, 80)
    }
    rect(0,0, 600, 600)
    drawText();
}

function drawText() {
    if (textColorPicker != undefined) {
      fill(textColorPicker.color());
    }
    if (sizeSlider != undefined) {
      textSize(sizeSlider.value());
    }
    textAlign(CENTER, CENTER);
    // textFont(font);
    text(posterText, 10, 0, canvasWidth - 20, canvasHeight - 10);
}

function randomStory() {
   textStyle(BOLD)
    currentStory = random(stories);
    posterText = currentStory;
}

function saveCanvasAsPNG() {
    saveCanvas("Poster", "png");
}

function displayArtist(data) {
  const artistInfoContainer = document.getElementById("notesDiv");
  console.log(data)
  artistInfoContainer.innerHTML = `
<br>
    <strong>Bio</strong><br>
    <strong>Name:</strong> ${data.name}<br>
    <strong>Born:</strong> ${data.birthday} in ${data.hometown}<br>
    <strong>Nationality:</strong> ${data.nationality}<br> 
<br>

  `;
}
