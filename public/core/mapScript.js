let isPointFrom = true
let isStartPage = true

let listPointsFrom = []
let listPointsTo = []

let listPointsFromNames = []
let listPointsToNames = []

let listToRoute = []

let responseObj
let currentFromPointLL

let dimensionValue = 2
let earliest = 1
let latest = 100

let costPerWaitingTime = 1
let vehicleCapacity = 6

function initMap() {
    document.getElementById("page_loader").innerHTML = `
    <div class="loader_screen">
        <svg class="circular" viewBox="25 25 50 50">
            <circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="6" stroke-miterlimit="10"/>
        </svg>
    </div>`

    if (isStartPage) {
        document.getElementById("site_body").innerHTML = `
        <div class="position_list shadow">
            <div class="check_switch">
                <div class="switch_text_item"><p>Cars</p></div>
                <label class="switch">
                    <input type="checkbox" id="get_switch" onchange="getSwitchFunc()">
                    <span class="slider round"></span>
                </label>
                <div class="switch_text_item"><p>Points</p></div>
            </div>
        
            <div class="from_to_lists">
                <div class="list" id="from_list">
                    <p class="chose_text">Chose Car (From)</p>
                </div>
                <div class="list" id="to_list">
                    <p class="chose_text">Chose Points (To)</p>
                </div>
            </div>
        </div>
      
        <button type="button" class="send_button button_style" onclick="sendData()">Send Data</button>
        <button type="button" id="is_get_route" class="route_button button_style shadow" onclick="getRoute()">Get Route</button>
        
        <div class="pac-card shadow" id="pac-card">
            <div id="title">Search Location</div>
            <div id="car_point_data">
                <div class="car-grid-container">
                    <p id="downtime_p" class="sup_p">Downtime</p>
                    <input id="downtime_input" class="input_sup_data" type="number" placeholder="Time">
                    <p id="truck_capacity_p" class="sup_p">Truck Capacity</p>
                    <input id="truck_capacity_input" class="input_sup_data" type="number" placeholder="Kg">
                    <div class="spacer input_sup_data"></div>
                    <div class="spacer input_sup_data"></div>
                </div>
            </div>

            <div id="pac-container">
                <input id="pac-input" type="text" placeholder="Enter a location">
            </div>
        </div>
        
        <div id="map"></div>
        <div id="infowindow-content">
            <span id="place-name" class="title"></span><br>
            <span id="place-address"></span>
        </div>`

        // eslint-disable-next-line no-undef
        const map = new google.maps.Map(document.getElementById("map"), {
            center: {lat: 49.224313, lng: 28.4266849},
            zoom: 13,
        })

        const card = document.getElementById("pac-card")
        const input = document.getElementById("pac-input")
        const biasInputElement = document.getElementById("use-location-bias")
        const strictBoundsInputElement = document.getElementById("use-strict-bounds")
        const options = {
            componentRestrictions: {country: "ua"},
            fields: ["formatted_address", "geometry", "name"],
            origin: map.getCenter(),
            strictBounds: false,
            types: ["establishment"],
        }

        // eslint-disable-next-line no-undef
        map.controls[google.maps.ControlPosition.TOP_RIGHT].push(card)
        // eslint-disable-next-line no-undef
        const autocomplete = new google.maps.places.Autocomplete(input, options)
        autocomplete.bindTo("bounds", map)
        // eslint-disable-next-line no-undef
        const infowindow = new google.maps.InfoWindow()
        const infowindowContent = document.getElementById("infowindow-content")
        infowindow.setContent(infowindowContent)

        // eslint-disable-next-line no-undef
        const marker = new google.maps.Marker({
            map,
            // eslint-disable-next-line no-undef
            anchorPoint: new google.maps.Point(0, -29),
        })

        autocomplete.addListener("place_changed", () => {
            infowindow.close()
            marker.setVisible(false)
            const place = autocomplete.getPlace()

            if (!place.geometry || !place.geometry.location) {
                window.alert("No details available for input: '" + place.name + "'")
                return
            }

            if (place.geometry.viewport) {
                map.fitBounds(place.geometry.viewport)

                if (isPointFrom) {
                    costPerWaitingTime = document.getElementById('downtime_input').value
                    vehicleCapacity = document.getElementById('truck_capacity_input').value
                    let pointFrom = {
                        "costPerWaitingTime": costPerWaitingTime,
                        "vehicleCapacity": vehicleCapacity,
                        "vehicleStartCoordinateX": place.geometry.location.lng(),
                        "vehicleStartCoordinateY": place.geometry.location.lat(),
                        "vehicleType": ((listPointsFrom.length + 1).toString() + '_veh').toString(),
                    }
                    let pointFromName = {
                        "name": place.name,
                        "lng": place.geometry.location.lng(),
                        "lat": place.geometry.location.lat(),
                        "id": ((listPointsFrom.length + 1).toString() + '_veh').toString(),
                    }
                    listPointsFrom.push(pointFrom)
                    listPointsFromNames.push(pointFromName)
                } else {
                    let dayEar = document.getElementById('day_earliest').value
                    let timeEar = document.getElementById('time_earliest').value
                    let dayLat = document.getElementById('day_latest').value
                    let timeLat = document.getElementById('time_latest').value

                    let hourEar = timeEar.split(':')[0].replace(/^0/,'')
                    let minutesEar = timeEar.split(':')[1].replace(/^0/,'')
                    let hourLat = timeLat.split(':')[0].replace(/^0/,'')
                    let minutesLat = timeLat.split(':')[1].replace(/^0/,'')

                    earliest = (parseInt(dayEar) * 24 + parseInt(hourEar)) * 3600 + parseInt(minutesEar) * 60
                    latest = (parseInt(dayLat) * 24 + parseInt(hourLat)) * 3600 + parseInt(minutesLat) * 60
                    dimensionValue = document.getElementById('kg_point').value

                    if (earliest > latest) {
                        let earliestReverse = latest
                        let latestReverse = earliest
                        earliest = earliestReverse
                        latest = latestReverse
                    }

                    let pointTo = {
                        "dimensionValue": dimensionValue,
                        "earliest": earliest,
                        "latest": latest,
                        "locationY": place.geometry.location.lat(),
                        "locationX": place.geometry.location.lng(),
                        "serviceId": listPointsTo.length + 1,
                    }
                    let pointToName = {
                        "name": place.name,
                        "lng": place.geometry.location.lng(),
                        "lat": place.geometry.location.lat(),
                    }
                    listPointsTo.push(pointTo)
                    listPointsToNames.push(pointToName)
                }
                if (isPointFrom) {
                    document.getElementById('from_list').innerHTML = listPointsFromNames.map(e =>
                        `<div class="chosen_point"><p>${e.name}</p></div>`
                    ).join('')
                } else {
                    document.getElementById('to_list').innerHTML = listPointsToNames.map(e =>
                        `<div class="chosen_point"><p>${e.name}</p></div>`
                    ).join('')
                }

            } else {
                map.setCenter(place.geometry.location)
                map.setZoom(17)
            }

            marker.setPosition(place.geometry.location)
            marker.setVisible(true)
            infowindowContent.children["place-name"].textContent = place.name
            infowindowContent.children["place-address"].textContent = place.formatted_address
            infowindow.open(map, marker)
        })

        function setupClickListener(id, types) {
            const radioButton = document.getElementById(id)
            radioButton.addEventListener("click", () => {
                autocomplete.setTypes(types)
                input.value = ""
            })
        }

        setupClickListener("changetype-all", [])
        setupClickListener("changetype-address", ["address"])
        setupClickListener("changetype-establishment", ["establishment"])
        setupClickListener("changetype-geocode", ["geocode"])

        biasInputElement.addEventListener("change", () => {
            if (biasInputElement.checked) {
                autocomplete.bindTo("bounds", map)
            } else {
                autocomplete.unbind("bounds")
                autocomplete.setBounds({east: 180, west: -180, north: 90, south: -90})
                strictBoundsInputElement.checked = biasInputElement.checked
            }
            input.value = ""
        })

        strictBoundsInputElement.addEventListener("change", () => {
            autocomplete.setOptions({
                strictBounds: strictBoundsInputElement.checked,
            })

            if (strictBoundsInputElement.checked) {
                biasInputElement.checked = strictBoundsInputElement.checked
                autocomplete.bindTo("bounds", map)
            }
            input.value = ""
        })

    } else {
        document.getElementById("site_body").innerHTML = `
        <div id="floating-panel" class="shadow text_style">
            <div class="route_title">
                <p class="p_option">Routes</p>
            </div>
            <p class="b_option">Car:</p>
            <select id="start" class="main_select">
                <option class="select_text_style" id="start_option" disabled selected value>Select car</option>
            </select>
        </div>
        <div id="map"></div>`

        // eslint-disable-next-line no-undef
        let directionsService = new google.maps.DirectionsService
        // eslint-disable-next-line no-undef
        let directionsDisplay = new google.maps.DirectionsRenderer
        // eslint-disable-next-line no-undef
        let map = new google.maps.Map(document.getElementById('map'), {
            zoom: 12,
            center: {lat: 49.224313, lng: 28.4266849},
        })
        directionsDisplay.setMap(map)

        let onChangeHandler = function () {
            calculateAndDisplayRoute(directionsService, directionsDisplay)
        }
        document.getElementById('start').addEventListener('change', onChangeHandler)
    }

    function calculateAndDisplayRoute(directionsService, directionsDisplay) {

        let originValLat = parseFloat(document.getElementById('start').value.split('|')[0])
        let originValLng = parseFloat(document.getElementById('start').value.split('|')[1])

        console.log('console.log start option')
        console.log(document.getElementById('start').value);

        currentFromPointLL = document.getElementById('start').value.replaceAll('|', '')
        let toWaypoints = []
        let lastDestination

        for (let i = 0; i < responseObj.length; i++) {
            if ((responseObj[i].lat.toString() + responseObj[i].lng.toString()) === currentFromPointLL) {
                if (Array.isArray(responseObj[i].act)) {
                    listToRoute = responseObj[i].act
                } else {
                    listToRoute = [responseObj[i].act]
                }
            }
        }

        for (let i = 0; i < listToRoute.length; i++) {
            if(i === listToRoute.length - 1) {
                // eslint-disable-next-line no-undef
                // lastDestination = new google.maps.LatLng(parseFloat(listToRoute[i].lng), parseFloat(listToRoute[i].lat)) // TODO: If invalid lat/lng
                // eslint-disable-next-line no-undef
                lastDestination = new google.maps.LatLng(parseFloat(listToRoute[i].lat), parseFloat(listToRoute[i].lng)) // TODO: If valid lat/lng
            } else {
                toWaypoints.push(
                    {
                        // eslint-disable-next-line no-undef
                        // location: new google.maps.LatLng(parseFloat(listToRoute[i].lng), parseFloat(listToRoute[i].lat)), // TODO: If invalid lat/lng
                        // eslint-disable-next-line no-undef
                        location: new google.maps.LatLng(parseFloat(listToRoute[i].lat), parseFloat(listToRoute[i].lng)), // TODO: If valid lat/lng
                        stopover: true,
                    }
                )
            }
        }

        console.log('TO Waypoints length')
        console.log(toWaypoints.length)

        directionsService.route({
            // eslint-disable-next-line no-undef
            origin: new google.maps.LatLng(originValLat, originValLng),
            destination: lastDestination,
            waypoints: toWaypoints,
            optimizeWaypoints: true,
            travelMode: 'DRIVING'
        }, function (response, status) {
            if (status === 'OK') {
                directionsDisplay.setDirections(response)
            } else {
                window.alert('Directions request failed due to ' + status)
            }
        })
    }

    if (listPointsFromNames.length > 0) {
        document.getElementById('start').innerHTML = listPointsFromNames.map(e =>
            `<select class="select_text_style main_select" id="start">
                <option class="select_text_style" value='${e.lat + '|' + e.lng}'>${e.name}</option>
            </select>`
        ).join('')
    }
}

function getSwitchFunc() {
    isPointFrom = !isPointFrom
    if(isPointFrom) {
        document.getElementById("car_point_data").innerHTML = `
        <div class="car-grid-container">
            <p id="downtime_p" class="sup_p">Downtime</p>
            <input id="downtime_input" class="input_sup_data" type="number" placeholder="Time">
            <p id="truck_capacity_p" class="sup_p">Truck Capacity</p>
            <input id="truck_capacity_input" class="input_sup_data" type="number" placeholder="Kg">
            <div class="spacer input_sup_data"></div>
            <div class="spacer input_sup_data"></div>
        </div>`
    } else {
        document.getElementById("car_point_data").innerHTML = `
        <div class="point-grid-container">
            <p id="earliest_p" class="sup_p">Earliest</p>
            <select class="input_sup_data" id="day_earliest">
                <option disabled selected value>Day</option>
                <option value="0">Mo</option>
                <option value="1">Tu</option>
                <option value="2">We</option>
                <option value="3">Th</option>
                <option value="4">Fr</option>
            </select>
            <input type="time" id="time_earliest" class="input_sup_data" placeholder="Earliest">
                
            <p id="latest_p" class="sup_p">Latest</p>
            <select class="input_sup_data" id="day_latest">
                <option disabled selected value>Day</option>
                <option value="0">Mo</option>
                <option value="1">Tu</option>
                <option value="2">We</option>
                <option value="3">Th</option>
                <option value="4">Fr</option>
            </select>
            <input type="time" class="input_sup_data" id="time_latest" placeholder="Latest">
                
            <p id="carrying_p" class="sup_p">Carrying</p>
            <input id="kg_point" class="input_sup_data" type="number" placeholder="Kg">
        </div>`
    }
}

async function sendData() {
    displayStyle( document.getElementById('page_loader'), 'block')

    let data = JSON.stringify({
        "depots": listPointsFrom,
        "services": listPointsTo,
    })

    const xhr = new XMLHttpRequest()
    xhr.withCredentials = false

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {
            console.log('DONE')
            displayStyle( document.getElementById('page_loader'), 'none')
            displayStyle( document.getElementById('is_get_route'), 'block')
            let parseJSON = JSON.parse(this.responseText)
            responseObj = parseJSON.problem.solutions.solution[0].routes.route
        } else {
            console.log('SEND')
            console.log(this.responseText)
        }
    })

    xhr.open("POST", "https://vrp-solution.herokuapp.com/solve")
    xhr.setRequestHeader("Content-Type", "application/json")
    xhr.setRequestHeader("Accept", "application/json")

    xhr.send(data)
}

function getRoute() {
    isStartPage = !isStartPage
    initMap()
}

function displayStyle(node, style) {
    node.style.display = style
}



