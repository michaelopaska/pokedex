export type PokemonDetail = {
    id?: number,
    name?: string,
    sprite?: string,
    height?: number,
    weight?: number,
    type?: string[],
    stats?: {
        hp?: number,
        attack?: number,
        specialAttack?: number,
        specialDefense?: number,
        speed?: number
    }
}