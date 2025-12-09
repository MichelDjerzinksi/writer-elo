import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

function Ranking() {
    const [authors, setAuthors] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAuthors()
    }, [])

    const fetchAuthors = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('authors')
            .select('*')
            .order('elo', { ascending: false })

        if (error) {
            console.error('Error:', error)
        } else {
            setAuthors(data)
        }
        setLoading(false)
    }

    const addAuthor = async (e) => {
        e.preventDefault()
        const name = e.target.authorName.value
        if (!name) return

        const { data, error } = await supabase.from('authors').insert([{ name }]).select()
        if (!error && data) {
            setAuthors([...authors, data[0]].sort((a, b) => b.elo - a.elo))
            e.target.reset()
        }
    }

    if (loading) return <div className="loading">...</div>

    return (
        <div className="ranking-container">
            <h1>rankings</h1>
            <table className="ranking-table">
                <tbody>
                    {authors.map((author, index) => (
                        <tr key={author.id}>
                            <td className="rank">{index + 1}.</td>
                            <td className="name">
                                {author.image_url && <img src={author.image_url} alt="" className="tiny-img" />}
                                {author.name}
                            </td>
                            <td className="elo">{author.elo}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <form onSubmit={addAuthor} className="add-form">
                <input name="authorName" placeholder="add author..." autoComplete="off" />
            </form>
        </div>
    )
}

export default Ranking
