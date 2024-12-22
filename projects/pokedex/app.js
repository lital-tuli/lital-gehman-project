const pokemonCount = 300;
var pokedex = {};

window.onload = async function() {
    for (let i = 1; i <= pokemonCount; i++) {
        await getPokemon(i);
    }
    
    updatePokemonList();
    
    document.getElementById("pokemon-description").innerText = pokedex[1]["desc"];
    
    document.getElementById("pokemon-img").src = pokedex[1]["img"];
    
    updateTypes(1);
    
    populateTypeFilter();
    
    document.getElementById("search-input").addEventListener("input", filterPokedex);
    document.getElementById("type-select").addEventListener("change", filterPokedex);
}

async function getPokemon(num) {
    let url = "https://pokeapi.co/api/v2/pokemon/" + num.toString();
    
    let res = await fetch(url);
    let pokemon = await res.json();
    
    let pokemonName = pokemon["name"];
    let pokemonType = pokemon["types"];
    let pokemonImg = pokemon["sprites"]["front_default"];
    
    res = await fetch(pokemon["species"]["url"]);
    let pokemonDesc = await res.json();
    
    pokemonDesc = pokemonDesc["flavor_text_entries"][9]["flavor_text"];
    
    pokedex[num] = {
        "name": pokemonName,
        "img": pokemonImg,
        "types": pokemonType,
        "desc": pokemonDesc
    };
}

function updateTypes(pokemonId) {
    let typesDiv = document.getElementById("pokemon-types");
    typesDiv.innerHTML = '';
    
    let types = pokedex[pokemonId]["types"];
    for (let i = 0; i < types.length; i++) {
        let type = document.createElement("span");
        type.innerText = types[i]["type"]["name"].toUpperCase();
        type.classList.add("type-box");
        type.classList.add(types[i]["type"]["name"]);
        typesDiv.append(type);
    }
}

function updatePokemon() {
    let pokemonId = this.id;
    document.getElementById("pokemon-img").src = pokedex[pokemonId]["img"];
    updateTypes(pokemonId);
    document.getElementById("pokemon-description").innerText = pokedex[pokemonId]["desc"];
}

function populateTypeFilter() {
    let typeSelect = document.getElementById("type-select");
    let uniqueTypes = new Set();
    
    // Clear existing options except "All Types"
    typeSelect.innerHTML = '<option value="">All Types</option>';
    
    // Collect unique types
    for (let id in pokedex) {
        pokedex[id]["types"].forEach(type => {
            uniqueTypes.add(type["type"]["name"]);
        });
    }
    
    // Add type options
    Array.from(uniqueTypes).sort().forEach(type => {
        let option = document.createElement("option");
        option.value = type;
        option.textContent = type.toUpperCase();
        typeSelect.appendChild(option);
    });
}

function filterPokedex() {
    let searchText = document.getElementById("search-input").value.toLowerCase();
    let selectedType = document.getElementById("type-select").value.toLowerCase();
    let pokemonListContainer = document.getElementById("pokemon-list");
    
    // Clear current list
    pokemonListContainer.innerHTML = "";
    
    // Filter Pokemon
    for (let id in pokedex) {
        let pokemon = pokedex[id];
        let pokemonTypes = pokemon.types.map(type => type.type.name);
        
        // Check if Pokemon matches both filters
        let matchesSearch = pokemon.name.toLowerCase().includes(searchText);
        let matchesType = !selectedType || pokemonTypes.includes(selectedType);
        
        if (matchesSearch && matchesType) {
            let pokemonDiv = document.createElement("div");
            pokemonDiv.id = id;
            pokemonDiv.innerText = `${id}. ${pokemon.name.toUpperCase()}`;
            pokemonDiv.classList.add("pokemon-name");
            
            // Add type-based styling
            pokemonDiv.classList.add(`${pokemonTypes[0]}-bg`);
            
            pokemonDiv.addEventListener("click", updatePokemon);
            pokemonListContainer.appendChild(pokemonDiv);
        }
    }
    
    // Show "No results" message if needed
    if (pokemonListContainer.children.length === 0) {
        let noResults = document.createElement("div");
        noResults.innerText = "No Pokemon found matching your search.";
        noResults.classList.add("no-results");
        pokemonListContainer.appendChild(noResults);
    }
}

function updatePokemonList() {
    let pokemonListContainer = document.getElementById("pokemon-list");
    pokemonListContainer.innerHTML = "";
    
    for (let id in pokedex) {
        let pokemonTypes = pokedex[id].types.map(type => type.type.name);
        let pokemonDiv = document.createElement("div");
        pokemonDiv.id = id;
        pokemonDiv.innerText = `${id}. ${pokedex[id].name.toUpperCase()}`;
        pokemonDiv.classList.add("pokemon-name");
        pokemonDiv.classList.add(`${pokemonTypes[0]}-bg`);
        pokemonDiv.addEventListener("click", updatePokemon);
        pokemonListContainer.appendChild(pokemonDiv);
    }
}