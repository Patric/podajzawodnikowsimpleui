const selectCountryTextbox = document.getElementsByClassName('select-country-textbox')[0];
const result = document.getElementById('result');
const dropdownMenu = document.querySelector('.dropdown .menu');
const dropdownTitle = document.querySelector('.dropdown .title');
const notFoundNode = document.createElement('span');
notFoundNode.setAttribute('id', 'not-found');
notFoundNode.style = 'text-color: red';
notFoundNode.innerHTML='Not found';

let contestants = [];


function toggleMenuDisplay(e) {
    const dropdown = e.currentTarget.parentNode;
    const menu = dropdown.querySelector('.menu');
    const icon = dropdown.querySelector('.fa-angle-right');

    toggleClass(menu, 'hide');
    toggleClass(icon, 'rotate-90');
}

function handleOptionSelected(e) {
    toggleClass(e.target.parentNode, 'hide');

    const id = e.target.id;
    const newValue = e.target.textContent + ' ';
    const titleElem = document.querySelector('.dropdown .title');
    const icon = document.querySelector('.dropdown .title .fa');


    titleElem.textContent = newValue;
    titleElem.appendChild(icon);

    //trigger custom event
    document.querySelector('.dropdown .title').dispatchEvent(new Event('change'));
    //setTimeout is used so transition is properly shown
    setTimeout(() => toggleClass(icon, 'rotate-90', 0));
}

function handleTitleChange(e) {
    const result = document.getElementById('result');
    result.innerHTML = 'The result is: ' + e.target.textContent;
    const constestantDetails = contestants.find(function(contestant) {
        const conestantDetails = `${contestant.inie} ${contestant.nazwisko}`
         return conestantDetails.trim() === e.target.textContent.trim();
        })
    result.innerHTML += JSON.stringify(constestantDetails);
}



dropdownTitle.addEventListener('click', toggleMenuDisplay);
document.querySelector('.dropdown .title').addEventListener('change', handleTitleChange);

function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();

    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

function get(url) {
    return window.fetch(url, {
        method: "GET"
    }).then(function (response) {
        return response.json();
    })
};

function createDropdownOption(index, content) {
    const optionNode = document.createElement('div');
    optionNode.setAttribute('class', 'option');
    optionNode.setAttribute('id', index);
    optionNode.innerHTML = content;
    optionNode.addEventListener('click', handleOptionSelected)
    dropdownMenu.appendChild(optionNode)
}

function onSelectCountryCheckboxChanged(e) {
    const url = `https://functionapp120211128163325.azurewebsites.net/api/podajzawodnikow?kraj=${e.target.value}&fbclid=IwAR21RPsmdGwA6rQ3-finsH0vFvHwH8paMIgm03bzPDq_g9WFJYKOrYh9_sw`;
    get(url).then(function (response) {
        dropdownMenu.innerHTML='';
        if (response.length === 0) {
            selectCountryTextbox.parentNode.appendChild(notFoundNode)
        }
        else{
            selectCountryTextbox.parentNode.removeChild(notFoundNode)
        }
        contestants = response;
        response.forEach(function (element, index) {
            createDropdownOption(index, `${element.inie} ${element.nazwisko}`)
        });
    })
}
selectCountryTextbox.addEventListener('input', onSelectCountryCheckboxChanged)


function toggleClass(elem, className) {
    if (elem.className.indexOf(className) !== -1) {
        elem.className = elem.className.replace(className, '');
    } else {
        elem.className = elem.className.replace(/\s+/g, ' ') + ' ' + className;
    }

    return elem;
}

function toggleDisplay(elem) {
    const curDisplayStyle = elem.style.display;

    if (curDisplayStyle === 'none' || curDisplayStyle === '') {
        elem.style.display = 'block';
    } else {
        elem.style.display = 'none';
    }

}