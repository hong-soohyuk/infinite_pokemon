import "./styles.css";
import {
  QueryClient,
  QueryClientProvider,
  useInfiniteQuery
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
  const fetchPokemon = async (
    key,
    nextUrl = "https://pokeapi.co/api/v2/pokemon"
  ) => {
    const { data } = await axios.get(nextUrl);

    const results = await Promise.all(
      data.results.map(async (pokemon) => {
        const { data } = await axios.get(pokemon.url);
        const imgUrl = data.sprites.front_default;
        return { name: pokemon.name, imgUrl };
      })
    );

    console.log(data);
    return { results, nextUrl: data.next };
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useInfiniteQuery("pokemons", fetchPokemon, {
    getNextPageParam: (lastPage) => lastPage.nextUrl
  });

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
        <button onClick={fetchNextPage} disabled={isFetchingNextPage}>
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
