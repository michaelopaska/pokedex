import { PokemonDetail } from "./types/PokemonDetail";
import { PokemonSummary } from "./types/PokemonSummary";
import { PokemonTypes } from "./types/PokemonTypes";

const API_URL = "https://beta.pokeapi.co/graphql/v1beta";

export async function getAllPokemon(pagesize: number = 50, pagenum: number = 0, filter: string = "id: asc"): Promise<PokemonSummary[]>{
    const arrayOfPokemon: PokemonSummary[] = [];
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({query: `
        query samplePokeAPIquery {
            pokemon_v2_pokemon(limit: ${pagesize}, offset: ${(pagenum * pagesize)}, where: {is_default: {_eq: true}}, order_by: {${filter}}) {
              name
              id
              pokemon_v2_pokemontypes {
                pokemon_v2_type {
                  name
                }
              }
            }
          }
        `}),
    });
    const result = await res.json();

      result.data.pokemon_v2_pokemon.forEach(element => {
        let types: string[] = [];
        element.pokemon_v2_pokemontypes.forEach(type => {
            types.push(type.pokemon_v2_type.name);
        });
        let pm: PokemonSummary = {
            id: element.id,
            name: element.name,
            sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${element.id}`,
            type: types,
        };

        arrayOfPokemon.push(pm);
      });

        
    return arrayOfPokemon;

}

export async function getPokemon(id: number): Promise<PokemonDetail>{
  let returnPokemon: PokemonDetail = {};

  const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({query: `
      query samplePokeAPIquery {
          pokemon_v2_pokemon(where: {id: {_eq: ${id}}, is_default:{_eq: true}}) {
            name
            id
            pokemon_v2_pokemonstats {
              base_stat
              pokemon_v2_stat {
                name
              }
            }
            pokemon_v2_pokemontypes {
              pokemon_v2_type {
                name
              }
            }
            height
            weight
          }
        }
      `}),
  });

  const result = await res.json();
  
  result.data.pokemon_v2_pokemon.forEach((el) => {
    let types: string[] = [];
    el.pokemon_v2_pokemontypes.forEach(type => {
        types.push(type.pokemon_v2_type.name);
    });
    returnPokemon.name = el.name;
    returnPokemon.id = el.id;
    returnPokemon.sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${el.id}`;
    returnPokemon.type = types;
    returnPokemon.height = el.height;
    returnPokemon.weight = el.weight;
    returnPokemon.stats = {};
    el.pokemon_v2_pokemonstats.forEach((stat) => {
        switch(stat.pokemon_v2_stat.name){
            case 'hp':
                returnPokemon.stats.hp = stat.base_stat;
                break;
            case 'attack':
                returnPokemon.stats.attack = stat.base_stat;
                break;
            case 'special-defense':
                returnPokemon.stats.specialDefense = stat.base_stat;
                break;
            case 'special-attack':
                returnPokemon.stats.specialAttack = stat.base_stat;
                break;
            case 'speed':
                returnPokemon.stats.speed = stat.base_stat;
                break;
        }   
    });
  });

  return returnPokemon;
}

//These two functions are from Rob - I didn't originally see the need for these two... but then I started to realize that I need the types, and I also need the ids.

export async function getAllPokemonTypes() {
  const query:string =`query {
    getPokemonTypes: pokemon_v2_pokemontype(distinct_on: type_id) {
      type: pokemon_v2_type {
        name
        displaynames: pokemon_v2_typenames(where: {language_id: {_eq: 9}}) {
          displayname: name
        }
      }
    }
  }`;
  
  let data: Response = await fetch(API_URL, {
    method: 'POST',
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query: query
    })
  })

  let allTypes = await data.json();
  let types = allTypes.data.getPokemonTypes.map((type:PokemonTypes) => ({value: type.type.name, display: type.type.displaynames[0].displayname}));
  return types;
}

export async function getAllPokemonIds(type: string = '') {
  const query:string =`query getAllIds($where: pokemon_v2_pokemon_bool_exp) {
    getAllIds: pokemon_v2_pokemon(where: $where) {
      id: pokemon_species_id
    }
  }`;

  //I'm still annoyed by this is default thing
  let where:any = {
    is_default: {_eq: true}
  };

  if (type !== '') {
    where.pokemon_v2_pokemontypes = {pokemon_v2_type: {name: {_eq: type}}}
  }

  const variables = {
    where: where
  };
  
  
  let data: Response = await fetch(API_URL, {
    method: 'POST',
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query: query,
      variables: variables
    })
  })


  let allIds = await data.json();
  return allIds.data.getAllIds;
}