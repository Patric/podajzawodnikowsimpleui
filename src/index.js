const selectCountryTextbox = document.getElementsByClassName('select-country-textbox')[0];
const result = document.getElementById('result');
const dropdownMenu = document.querySelector('.dropdown .menu');
const dropdownTitle = document.querySelector('.dropdown .title');
const notFoundNode = document.createElement('span');
notFoundNode.setAttribute('id', 'not-found');
notFoundNode.innerHTML = 'Not found';
const loadingNode = document.createElement('span');
loadingNode.setAttribute('id', 'loading');
loadingNode.innerHTML = 'Loading...';
const contestantsTable = document.getElementById('contestants-table');

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

    document.querySelector('.dropdown .title').dispatchEvent(new Event('change'));
    setTimeout(() => toggleClass(icon, 'rotate-90', 0));
}

function handleTitleChange(e) {
    const result = document.getElementById('result');
    result.innerHTML = 'The result is: ' + e.target.textContent;
    const constestantDetails = contestants.find(function (contestant) {
        const conestantDetails = `${contestant.inie} ${contestant.nazwisko}`
        return conestantDetails.trim() === e.target.textContent.trim();
    })
    result.innerHTML += JSON.stringify(constestantDetails);
}

dropdownTitle.addEventListener('click', toggleMenuDisplay);
document.querySelector('.dropdown .title').addEventListener('change', handleTitleChange);

function get(url) {
    return window.fetch(url, {
        method: "GET"
    }).then(function (response) {
        return response.json();
    })
};

function post(url, bodyData) {
    return window.fetch(url, {
        method: "POST",
        body: bodyData
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

function displayLoadingInformation() {
    selectCountryTextbox.parentNode.appendChild(loadingNode)
}

function hideLoadingInformation() {
    selectCountryTextbox.parentNode.contains(loadingNode) &&
        selectCountryTextbox.parentNode.removeChild(loadingNode)
}

function fetchContestantsForCountry(country) {
    displayLoadingInformation();
    const url = `https://functionapp120211128163325.azurewebsites.net/api/podajzawodnikow?kraj=${country}&fbclid=IwAR21RPsmdGwA6rQ3-finsH0vFvHwH8paMIgm03bzPDq_g9WFJYKOrYh9_sw`;
    return get(url);
}

function getInputNode(contestantId) {
    const inputFileNode = document.createElement("input");
        Object.assign(inputFileNode, {
            type: 'file',
            accept: 'image/png, image/jpeg',
            multiple: "false",
            id: contestantId 
        });
        inputFileNode.addEventListener('input', updateImage, false);
        return inputFileNode;
}

class DataRow {
    static toDataRowNode(arrayOfValues) {
        const dataRow = document.createElement('tr');
        arrayOfValues.forEach(function(element) {
            const td = document.createElement('td');
            td.innerHTML = element;
            dataRow.appendChild(td);
        });
        return dataRow;
    }
}

class Spodash {
    static isStringDefined(input) {
        return input !== '' && input !== undefined && input !== null;
    }
}

class Contestant {
    constructor(id_zawodnika,
        data_ur,
        id_trenera,
        imie, 
        kraj,
        nazwisko,
        waga,
        wzrost,
        zdjecie_uuid) {
            this.id_zawodnika = id_zawodnika;
            this.data_ur = data_ur;
            this.id_trenera = id_trenera;
            this.imie = imie;
            this.kraj = kraj;
            this.nazwisko = nazwisko;
            this.waga = waga;
            this.wzrost = wzrost;
            this.zdjecie_uuid = zdjecie_uuid;
        }

        getDataRowNode() {
            const dataRow = DataRow.toDataRowNode([
                this.id_trenera,
                this.imie, 
                this.nazwisko,
                this.kraj,
                this.data_ur,
                this.wzrost,
                this.waga]);

            const td = document.createElement('td');
            if (Spodash.isStringDefined(this.zdjecie_uuid)) {
                const imgNode = getImageNode(`https://labpwstorage.blob.core.windows.net/photos/${this.zdjecie_uuid}`, this.zdjecie_uuid);
                td.appendChild(imgNode);
            }
                const inputFileElem = getInputNode(this.id_zawodnika);
                td.appendChild(inputFileElem);
                dataRow.appendChild(td);
            return dataRow;
        }

}

function populateTable(contenstans) {
    contestantsTable.innerHTML = '';
    contenstans.forEach(function (contestant) {
        const contestantDataRowNode = new Contestant(contestant.id_zawodnika,
            contestant.data_ur,
            contestant.id_trenera,
            contestant.inie, 
            contestant.kraj,
            contestant.nazwisko,
            contestant.waga,
            contestant.wzrost,
            contestant.zdjecie_uuid).getDataRowNode();
        contestantsTable.appendChild(contestantDataRowNode)
    })
}

function getImageNode(url, id = 'image') {
    const img = document.createElement('img');
    img.setAttribute('src', url);
    img.setAttribute('id', id);
    return img;
}


function updateImage(e) {
    var formData = new FormData();
    formData.append("fileToUpload", this.files[0]);
    let imgFound = false;
    for(childNode of this.parentNode.childNodes) {
        if(childNode.tagName === 'IMG'){
            childNode.setAttribute('src', URL.createObjectURL(this.files[0]));
            imgFound = true;
        }
    }
    if (!imgFound) {
        const img = getImageNode(URL.createObjectURL(this.files[0]));
        this.before(img);
    }
  
    post(`https://photouploadpw.azurewebsites.net/api/PhotoUpload?zawodnik=${this.id}`, formData).then(function (response) {
    }).finally(function () {

    })
}

function onSelectCountryCheckboxChanged(e) {
    fetchContestantsForCountry(e.target.value).then(function (response) {
            dropdownMenu.innerHTML = '';
            if (response.length === 0) {
                selectCountryTextbox.parentNode.appendChild(notFoundNode)
            } else {
                selectCountryTextbox.parentNode.contains(notFoundNode) &&
                    selectCountryTextbox.parentNode.removeChild(notFoundNode)
            }
            contestants = response;
            populateTable(response);
            response.forEach(function (element, index) {
                createDropdownOption(index, `${element.inie} ${element.nazwisko}`)
            });
        })
        .finally(function () {
            hideLoadingInformation();
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