import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { calculateNewRatings } from './elo'

function Voting() {
    const [authors, setAuthors] = useState([])
    const [matchup, setMatchup] = useState([null, null]) // [AuthorA, AuthorB]
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAuthors()
    }, [])

    const fetchAuthors = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('authors')
            .select('*')

        if (error) {
            console.error('Error fetching authors:', error)
        } else {
            setAuthors(data)
            if (data.length >= 2) {
                pickRandomMatchup(data)
            }
        }
        setLoading(false)
    }

    const pickRandomMatchup = (allAuthors) => {
        if (allAuthors.length < 2) return

        const idx1 = Math.floor(Math.random() * allAuthors.length)
        let idx2 = Math.floor(Math.random() * allAuthors.length)

        while (idx1 === idx2) {
            idx2 = Math.floor(Math.random() * allAuthors.length)
        }

        setMatchup([allAuthors[idx1], allAuthors[idx2]])
    }

    const handleVote = async (winner, loser) => {
        const { newWinnerElo, newLoserElo } = calculateNewRatings(winner.elo, loser.elo)

        // Optimistic Update
        const updatedAuthors = authors.map(a => {
            if (a.id === winner.id) return { ...a, elo: newWinnerElo, matches_played: a.matches_played + 1 }
            if (a.id === loser.id) return { ...a, elo: newLoserElo, matches_played: a.matches_played + 1 }
            return a
        })

        setAuthors(updatedAuthors)
        pickRandomMatchup(updatedAuthors)

        // DB Update
        try {
            await supabase.from('authors').upsert([
                { id: winner.id, name: winner.name, elo: newWinnerElo, matches_played: winner.matches_played + 1 },
                { id: loser.id, name: loser.name, elo: newLoserElo, matches_played: loser.matches_played + 1 }
            ])
            await supabase.from('matches').insert([{ winner_id: winner.id, loser_id: loser.id }])
        } catch (err) {
            console.error('Error saving vote:', err)
        }
    }

    if (loading && authors.length === 0) return <div className="loading">...</div>
    const [left, right] = matchup

    return (
        <div className="voting-container">
            <h1>vs</h1>
            {(left && right) ? (
                <div className="arena">
                    <div className="matchup-row">
                        <div className="author-card" onClick={() => handleVote(left, right)} style={{ cursor: 'pointer' }}>
                            {left.image_url && <img src={left.image_url} alt={left.name} className="author-img" />}
                            <button className="vote-btn">
                                {left.name}
                            </button>
                        </div>
                        <span className="divider">/</span>
                        <div className="author-card" onClick={() => handleVote(right, left)} style={{ cursor: 'pointer' }}>
                            {right.image_url && <img src={right.image_url} alt={right.name} className="author-img" />}
                            <button className="vote-btn">
                                {right.name}
                            </button>
                        </div>
                    </div>
                    <button className="skip-link" onClick={() => pickRandomMatchup(authors)}>skip</button>
                </div>
            ) : (
                <div className="message">need more authors</div>
            )}
        </div>
    )
}

export default Voting
