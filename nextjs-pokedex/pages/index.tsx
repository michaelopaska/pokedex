// import Head from 'next/head';
import Head from 'next/head';
import { useState } from 'react';
import { getAllPokemon, getPokemon, getAllPokemonTypes, getAllPokemonIds } from '@/lib/pokemon';
import { PokemonDetail } from '@/lib/types/PokemonDetail';
import { PokemonSummary } from '@/lib/types/PokemonSummary';
import PokemonDetailCard from '@/components/pokemondetail';
import styles from '@/styles/Pokemon.module.css'
import { Inter } from 'next/font/google' //Rob found the font


const inter = Inter({ subsets: ['latin'] });
const page_max: number = 50; //RIP Mobile, just doing 50 per page
const ORDER_ARR: Order[] = [{id: "asc"}, {id: "desc"}, {name: "asc"}, {name: "desc"}]; //Rob set these up as types and I've tried to use ENUM instead but... I guess I'm just bad.
const ORDER_CONTROL: string[] = ["Pokedex ID (Ascending)", "Pokedex ID (Descending)", "Pokemon Name", "Pokemon Name (Reversed)"];

export default function Home({pokedexData, pokemonCount, pokemonTypes}:{PokemonList: PokemonSummary[], PokemonCount:number, pokeTypes: PokemonTypes[]}) {
  const [pokemen, setPokemen] = useState(pokedexData);
  const [offset, setOffset] = useState(0);
  const [typeVal, setTypeVal] = useState('');
  const [pokeTotal, setPokeTotal] = useState(pokemonCount);
  const [order, setOrder] = useState(0);

  // Couldn't do this if the API wasn't public / confidential key, we'd have to do server side rendering?
  function goNextPokemon() {
    if (offset >= pokeTotal - page_max) { return; }

    let newOffset:number = offset + page_max;
    loadPokemon(newOffset, typeVal, order);
  }

  function goPrevPokemon() {
    if (offset === 0) { return; }

    let newOffset:number = offset - page_max;
    if (newOffset < 0) {
      newOffset = 0
    }

    loadPokemon(newOffset, typeVal, order);
  }

  function updateFilter(type:string) {
    getAllPokemonIds(type).then((ids) => {
      setOffset(0)
      setPokeTotal(ids.length);
      loadPokemon(0, type, order);
    });
  }

  function updateOrder(id:number) {
    setOffset(0)
    loadPokemon(0, typeVal, id);
  }

  function loadPokemon(offset:number, type:string, orderid:number) {
    getAllPokemon(offset, type, ORDER_ARR[orderid]).then((pokemen) => {
      setOffset(offset);
      setTypeVal(type);
      setOrder(orderid);
      setPokemen(pokemen);
    })
  }

  return (
    <>
      <Head>
        <title>Poked(ap)ex</title>
      </Head>
      <div className={styles.mainContain}>
        <main className={`${styles.main} ${inter.className}`}>
          <div className={styles.mainHeader}><span>Pokédex</span></div>
          <div className={styles.flexRow}>
            <div>
              {/* These should be custom components */}
              <label>Type</label>
              <select value={typeVal} onChange={(e) => {updateFilter(e.target.value);}}>
                <option value=''>Any</option>
                {pokemonTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.display}</option>
                ))}
              </select>
            </div>
            <div>
              {/* But they aren't :(*/}
              <label>Sort By</label>
              <select value={order} onChange={(e) => {updateOrder(parseInt(e.target.value));}}>
                {ORDER_CONTROL.map((ordertype, index) => (
                  <option key={index} value={index}>{ordertype}</option>
                ))}
              </select>
            </div>
          </div>
          <div className={styles.gridContainer}>
            {pokemen.map((pokemon) => (<PokemonDetailCard key={pokemon.id} pokemon={pokemon} />))}
          </div>
          <div className={styles.buttonsContainer}>
            <button className={`${styles.button} arrow blue`} onClick={goPrevPokemon}>❮</button>
            <span>{offset}-{(offset + page_max > pokeTotal) ? pokeTotal : offset + page_max} of {pokeTotal}</span>
            <button className={`${styles.button} arrow blue`} onClick={goNextPokemon}>❯</button>
          </div>
        </main>
      </div>
    </>
  );
}

export async function getStaticProps() {
  const pokedexData = await getAllPokemon();
  const pokemonIds = await getAllPokemonIds();
  const pokemonTypes = await getAllPokemonTypes();
  //I boorrowed from Rob here and in other places.
  //I hit a roadbloack he already passed - he found a way to pass the ids around and get them into things like the image so it can be pre-rendered. 
  //Originally I had the images as data in my pokemon types but that doesn't really make sense in NEXT because we want to pre-fetch/pre-render as much as possible?
  //idk - my initial idea sucked and Rob's idea is actually working
  return {
    props: {
      pokedexData: pokedexData,
      pokemonCount: pokemonIds.length,
      pokemonTypes: pokemonTypes
    },
  };
}