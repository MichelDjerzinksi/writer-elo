import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'


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
        // Optimistic Update (Guessing new ELO for UI responsiveness)
        // Note: Real ELO is calculated on server, so next fetch will correct any drift
        const updatedAuthors = authors.map(a => {
            if (a.id === winner.id) return { ...a, matches_played: a.matches_played + 1 }
            if (a.id === loser.id) return { ...a, matches_played: a.matches_played + 1 }
            return a
        })

        setAuthors(updatedAuthors)
        pickRandomMatchup(updatedAuthors)

        // Secure DB Update
        try {
            const { error } = await supabase.rpc('vote_matchup', {
                winner_id: winner.id,
                loser_id: loser.id
            })

            if (error) throw error
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
