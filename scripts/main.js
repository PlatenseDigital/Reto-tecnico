let cars
const port = 3005
const url = 'http://localhost:'
const select = document.querySelector('#group')
const filters = document.getElementsByClassName('filter')
const carSection = document.querySelector('#cars')
const currencyCodes = {R$: 'BRL', US$: 'USD', AR$: 'ARS'}

let appliedFilters = []

fetch(url+port)
    .then(res => res.json())
    .then(res => {cars = res.cars; carsLoad(); selectorLoad()})
    .catch(err => {console.log(err), alert('Se ha producido un error en la lectura de datos, revisa la consola para mas informacion')})

function filterHandler(e){
    let index = appliedFilters.indexOf(e.target.name); 
    if (index !== -1) {
      appliedFilters.splice(index, 1)
    }
    else appliedFilters.push(e.target.name)
    carsLoad()
}

for (let index = 0; index < filters.length; index++) {
    const element = filters[index];
    element.addEventListener('change',e=>filterHandler(e))
}

select.addEventListener('change', ()=>carsLoad())

function selectorLoad(){
    Object.keys(cars).map(group=>{
        const option = document.createElement('option')
        option.setAttribute('value', group)
        option.innerText = 'Group '+group
        select.appendChild(option)
    })
}

function loadRates(rates){
    let str = ''
    let index = 1
    for (const rate in rates) {
        const actual = rates[rate]
        if (index < Object.keys(rates).length) str += '<div class="row rateRow underline">'
        else str += '<div class="row rateRow">'
        str += `
            <input type="radio" name="selectedCar">
            <div class="rateName">`+rate+' - '+actual.RateData.name+`</div>
            <div class="rateInc" name="`+rate+`">Rate Inclusions</div>
            <div class="ratePrice"><span class="priceCode">`+currencyCodes[actual.CurrencyCode]+`</span><span class="priceValue">`+(Math.round(actual.RateTotalAmount * 100) / 100)+`</span></div>
            </div>
        `
        index++
    }
    return str    
}

function ifPlural(num){
    if (num>1) return 's'
    else return ""
}

function loadCharacteristics(charac){
    let str = ''
    if(charac.hasOwnProperty('seats')) str += '<div class="charact"><img src="./assets/images/seats.svg" alt="">'+charac.seats+' seats</div>'
    if(charac.hasOwnProperty('largeSuitcase')) str += '<div class="charact"><img src="./assets/images/luggage.svg" alt="">'+charac.largeSuitcase+' large suitcase'+ifPlural(charac.largeSuitcase)+'</div>'
    if(charac.hasOwnProperty('smallSuitcase')) str += '<div class="charact"><img src="./assets/images/bag.svg" alt="">'+charac.smallSuitcase+' small suitcase'+ifPlural(charac.smallSuitcase)+'</div>'
    if(charac.hasOwnProperty('doors')) str += '<div class="charact"><img src="./assets/images/door.svg" alt="">'+charac.doors+' doors</div>'
    if(charac.hasOwnProperty('transmition')) str += '<div class="charact"><img src="./assets/images/transmision.svg" alt="">'+charac.transmition+' transmition</div>'
    if(charac.hasOwnProperty('air')) str += '<div class="charact"><img src="./assets/images/air-conditioning.svg" alt="">'+charac.air+'</div>'
    
    return str
}


function createCar(car){
        let newCar = document.createElement('section')
        let url = car.PictureURL
        url = url.replace(url.split("/").pop(),car.Features2.thumb)
        newCar.setAttribute('class', 'car')
        newCar.innerHTML = `
                <div class="row title">
                    <img src=`+url+` alt="">
                    <div class="description">
                        <h2>`+car.Features2.category+`</h2>
                        <p>GROUP `+car.VehGroup+` (`+car.Code+`)</p>
                        <p>`+car.Name.toUpperCase()+`</p>
                    </div>
                    <div class="callAction"><span>&#10004;</span>Book now!</div>
                </div>
                <div class="row carBody">
                    <div class="col characteristics">
                        `+loadCharacteristics(car.Features2)+`
                    </div>
                    <div class="col rates">
                        `+loadRates(car.Rates)+`
                    </div>
                </div>
        `

        incArr = newCar.querySelectorAll('.rateInc')
        for (let index = 0; index < incArr.length; index++) {
            const element = incArr[index];
            element.addEventListener('click',()=>modalHandler(car.Rates[element.getAttribute("name")].RateData.inclusions, element.getAttribute("name") + " - "+car.Rates[element.getAttribute("name")].RateData.name))
        }

        return newCar
}

function filterCar(car) {
    let res = false
    if(appliedFilters.length===0) res = true
    appliedFilters.forEach(filter => {

        switch (filter) {
            case "Manual transmission":
                if (car.Features2.transmition === "Manual") res = true;
                break;
            case "5 seats":
                if (car.Features2.seats === "5") res = true;
                break;
            case "Convertibles":
                if (car.Features2.category === "Convertible") res = true;
                break;
            case "Automatic transmission":
                if (car.Features2.transmition === "Automatic") res = true;
                break;
            case "7 seats or more":
                if (car.Features2.seats >= "7") res = true;
                break;
        
            default:
                break;
        }
    });
    return res
}

function modalHandler(inclusions, name){
    const table = document.createElement('div')
    table.setAttribute("class", "modalTable")
    table.innerHTML += `
        <span class="close">&#10006;</span>
        <h2>Rate information</h2>
        <h3>`+ name + `</h3>
    `
    if(inclusions !== undefined){
        const ul = document.createElement('ul')
        inclusions.map(included=>{
            ul.innerHTML += '<li>'+included+'</li>'
        })
        table.appendChild(ul)
    }else table.innerHTML += '<h1>This car doesnt includes nothing</h1>'
    const background = document.createElement('div')
    background.setAttribute("class", "modalBackground")
    background.appendChild(table)
    background.addEventListener('click', ()=>modalClose())
    document.body.appendChild(background)
}

function modalClose(){
    try {
        const r = document.querySelector('.modalBackground')
        document.body.removeChild(r)
    } catch (error) {}
    
}

function carsLoad(){
    while (carSection.firstChild) {
        carSection.removeChild(carSection.firstChild);
    }
    for (const group in cars) {
        if (select.value==="All") {
            for (const car in cars[group]) {
                if (filterCar(cars[group][car])) {
                    carSection.appendChild(createCar(cars[group][car]))
                }
            }
        }
        else{
            if (select.value===group) {
                for (const car in cars[group]) {
                    if (filterCar(cars[group][car])) carSection.appendChild(createCar(cars[group][car]))
                }
            }
        }
    }
    if (!carSection.firstChild){
        let message = document.createElement('section')
        message.innerHTML = "<h1>we don't have cars like this, try with other filters.</h1>"
        carSection.appendChild(message)
    }
}