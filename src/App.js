import "./styles.css";
import {
  QueryClient,
  QueryClientProvider,
  useInfiniteQuery,
} from "react-query";
import axios from "axios";

const PokemonCard = ({ name, spriteUrl }) => {
  return (
    <div>
      <div>{name}</div>
      <img src={spriteUrl} alt={`${name} sprite`} />
    </div>
  );
};

const PokemonList = () => {
  const fetchPokemon = async (page) => {
    const pokemonUrl = `https://pokeapi.co/api/v2/pokemon?offset=${page}&limit=20`;
    const { data } = await axios.get(pokemonUrl);

    const results = await Promise.all(
      data.results.map(async (pokemon) => {
        const { data } = await axios.get(pokemon.url);
        const imgUrl = data.sprites.front_default;
        return { name: pokemon.name, imgUrl };
      })
    );

    return { results, nextPage: page + 20 };
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery(
    "pokemons",
    ({ pageParam = 0 }) => fetchPokemon(pageParam),
    {
      getNextPageParam: (lastPage) => lastPage.nextPage,
    }
  );

  if (isLoading) return <div>Loading~</div>;
  if (error) return <div>Error!</div>;
  return (
    <div className="App">
      <h1>pokemon list</h1>
      {data.pages.map((page) =>
        page.results.map((pokemon) => (
          <PokemonCard
            key={pokemon.name}
            name={pokemon.name}
            spriteUrl={pokemon.imgUrl}
          />
        ))
      )}
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? "Loading more..." : "Load More"}
        </button>
      )}
    </div>
  );
};

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PokemonList />
    </QueryClientProvider>
  );
}
