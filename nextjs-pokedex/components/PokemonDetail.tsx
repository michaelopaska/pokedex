import styles from './pokemondetail.module.css'
import { PokemonDetail } from '@/lib/types/PokemonDetail'
import Image from 'next/image'
import PokemonStatsTable from './PokemonStatsTable'

export default function PokemonDetailCard ({ pokemon }: {pokemon: PokemonDetail}) {
  return (
    <>
      <div className={`${styles.flexRow} ${styles.splitem}`}>
        <section>
          <div className={`mainHeader`}><span>{pokemon.name}</span></div>
          <div className={styles.flexRow}>
            {pokemon.type.forEach((typename) => (
              <div key={typename.toLowerCase()} className={`${styles.poketype} ${styles[typename.toLowerCase()]}`}>{typename}</div>
            ))}
          </div>
          <div className={styles.pokenum}>#{pokemon.id.toString().padStart(4, '0')}</div>
        </section>
        <Image alt={pokemon.name}
              width={215}
              height={215}
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}/>
      </div>
      <div>
        <PokemonStatsTable pokemon={pokemon} />
      </div>
    </>
  )
}