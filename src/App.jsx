import { useState, useEffect } from 'react'
import Search from './components/Search'
import Spinner from './components/Spinner'
import MovieCard from './components/MovieCard'
import { useDebounce } from '@uidotdev/usehooks'
import { getTrendingMovies, updateSearchCount } from './appwrite'

const App = () => {

    const API_BASE_URL = 'https://api.themoviedb.org/3'
    const API_KEY = import.meta.env.VITE_TMDB_API_KEY
    const API_OPTIONS = {
       method: 'Get' ,
       headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
       }
    }

const [searchTerm, setsearchTerm] = useState('')
const [errorMessage, setErrorMessage] = useState('')
const [movieList, setMovieList] = useState([])
const [isLoading, setIsLoading] = useState(false)
const [debouncedSearchedTerm, setDebouncedSearchedTerm] = useState('')
const [trendingMovies, setTrendingMovies] = useState('')

useDebounce(() => setDebouncedSearchedTerm(searchTerm), 500, [searchTerm])
const fetchMovies = async (query = "") => {


    setIsLoading(true)
    setErrorMessage('')
    try {
    const endpoint = query ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}` :`${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
    const response = await fetch(endpoint, API_OPTIONS);

    if (!response.ok) {
      throw new Error(`Failed to fetch movies`);
    }
    const data = await response.json();
    console.log( 'Movie data:', data)

    if (data.response == 'False'){
        setErrorMessage(data.Error || 'Failed to fetch movies');
        setMovieList([])
        return;
    }
    setMovieList(data.results || [])

    if(query && data.results.length > 0){
        await updateSearchCount(query, data.results[0])
    }
    
  }

     catch(error) {
        console.error(`Error fetching movies: ${error}`)
        setErrorMessage('Error fetching movies. Please try again later.')

    } finally {
        setIsLoading(false)
    }
}
const loadTrendingMovies = async () => {
    try {
        const movies = await getTrendingMovies();

        setTrendingMovies(movies)
    } catch(error){
        console.error(`Error fetching trending movies: ${error}`)
        
    }
}
useEffect(() => {
    fetchMovies(debouncedSearchedTerm)
}, [debouncedSearchedTerm])

useEffect(() => {
    loadTrendingMovies()
}, [])

  return (
    <main>
        <div className='pattern'>
            <div className='wrapper'>
                <header>
                    <img src='./hero-img.png' alt="Hero Banner" />
                    <h1>Find <span className='text-gradient'>Movies</span> You'll Enjoy Without the Hassle</h1>
                <h1 className='text-white'>{searchTerm}</h1>
                <Search searchTerm={searchTerm} setsearchTerm={setsearchTerm}/>
                </header>

                {trendingMovies.length > 0 && (
                    <section className='trending'>
                        <h2>Trending Movies</h2>
                        <ul>
                            {trendingMovies.map((movie, index) => (
                                <li key={movie.$id}>
                                    <p>{index + 1}</p>
                                    <img src={movie.poster_url} alt={movie.title} srcset="" />
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
                
                <section className='all-movies'>
                    <h2>All Movies</h2>
                    {isLoading ? (<Spinner />) : errorMessage ? (
                        <p className='text-red-500'>{errorMessage}</p>
                    ) : (<ul>
                        {movieList.map((movie, key) =>(
                            <MovieCard key={movie.id} movie={movie}/>
                        ))}
                    </ul>)}
                </section>
                
            </div>
        </div>
    </main>
                )}

export default App