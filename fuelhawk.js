var models = {};

class Model{
    constructor(readings, universals) {
        if (readings.length != universals.length) {
            throw "Readings and Universals must match in length";
        }
        this.readings = readings.toSorted((a, b) => a - b);
        this.universals = universals.toSorted((a, b) => a - b);
    }
    interpolate(reading, from, to) {
        var result = null;
        for (let i=1; i < from.length; i++){
            let above = from[i];
            if (reading > above) {
                continue;
            }
            let below = from[i-1];
            let fraction = (reading - below) / (above - below);
            result = to[i - 1] + (to[i] - to[i - 1]) * fraction;
            return result;
        }
        return result;
    }
    toUniversal(reading) {
        return this.interpolate(reading, this.readings, this.universals);
    }
    fromUniversal(reading) {
        return this.interpolate(reading, this.universals, this.readings);
    }
}

async function extractModels(filename){
    var request = new Request(filename);
    const response = await fetch(request);
    const jsonString = await response.text();
    const data = JSON.parse(jsonString);
    var result = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = (new Model(value["readings"], value["universals"]));
    }
    return result;
}

function setBounds() {
    let fromModelName = document.getElementById("fromModel").value;
    let fromModel = models[fromModelName];
    let readingField = document.getElementById("reading");
    readingField.max = fromModel.readings[fromModel.readings.length - 1];
    readingField.min = fromModel.readings[0];
}

function recalculate() {
    let fromModelName = document.getElementById("fromModel").value;
    let toModelName = document.getElementById("toModel").value;
    let reading = document.getElementById("reading").value;
    let fromModel = models[fromModelName];
    let toModel = models[toModelName];
    let universalReading = fromModel.toUniversal(reading);
    let result = toModel.fromUniversal(universalReading);
    document.getElementById('convertedReading').innerHTML = result.toFixed(1) + " gal";
}

window.onload = async function setup() {
    await extractModels("models.json").then((response) => {
        models = response;
    })
    var fromModelSelect = document.getElementById("fromModel");
    var toModelSelect = document.getElementById("toModel");
    for (const [key, value] of Object.entries(models)) {
        fromModelSelect.add(new Option(key, key));
        toModelSelect.add(new Option(key, key));
    }
    recalculate();
}