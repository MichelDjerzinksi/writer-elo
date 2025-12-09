import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

// ----------------------------------------------------
// 1. PASTE YOUR LIST OF AUTHORS HERE
// ----------------------------------------------------
const authorsList = [
    "Agatha Christie",
    "Albert Camus",
    "Alberto Moravia",
    "Aldous Huxley",
    "Alejo Carpentier",
    "Aleksandr Solzhenitsyn",
    "Alessandro Manzoni",
    "Alexander Pushkin",
    "Alexandre Dumas",
    "Andrei Bely",
    "André Gide",
    "André Malraux",
    "Anton Chekhov",
    "Antonin Artaud",
    "Aristophanes",
    "Arthur Conan Doyle",
    "Arthur Rimbaud",
    "Boris Pasternak",
    "Bram Stoker",
    "Bruno Schulz",
    "C. S. Lewis",
    "Cesare Pavese",
    "Charles Baudelaire",
    "Charles Dickens",
    "Charlotte Brontë",
    "Chateaubriand",
    "D. H. Lawrence",
    "Daniel Defoe",
    "Dante Alighieri",
    "Dino Buzzati",
    "E. E. Cummings",
    "E. M. Forster",
    "Edgar Allan Poe",
    "Edith Wharton",
    "Ernest Hemingway",
    "Euripides",
    "F. Scott Fitzgerald",
    "Fernando Pessoa",
    "Flann O’Brien",
    "Flannery O’Connor",
    "Franz Kafka",
    "Friedrich Hölderlin",
    "Friedrich Nietzsche",
    "Friedrich Schiller",
    "Fyodor Dostoevsky",
    "Gabriel García Márquez",
    "George Eliot",
    "George Orwell",
    "Graham Greene",
    "Gustave Flaubert",
    "Gérard de Nerval",
    "H. G. Wells",
    "Henry James",
    "Herman Melville",
    "Hermann Broch",
    "Hermann Hesse",
    "Homer",
    "Honoré de Balzac",
    "Isaac Babel",
    "Italo Calvino",
    "Italo Svevo",
    "Ivan Goncharov",
    "Ivan Turgenev",
    "J. D. Salinger",
    "J.K. Huysmans",
    "J.R.R. Tolkien",
    "Jack Kerouac",
    "Jack London",
    "James Joyce",
    "Jane Austen",
    "Jean Racine",
    "Jean-Jacques Rousseau",
    "Jean-Paul Sartre",
    "Joaquim Maria Machado de Assis",
    "Johann Wolfgang von Goethe",
    "John Milton",
    "John Steinbeck",
    "John Updike",
    "John Williams",
    "Jonathan Swift",
    "Jorge Luis Borges",
    "Joseph Conrad",
    "José Donoso",
    "José Maria de Eça de Queirós",
    "José Saramago",
    "Julio Cortázar",
    "Jun’ichirō Tanizaki",
    "Kenzaburō Ōe",
    "Knut Hamsun",
    "Kurt Vonnegut",
    "Leo Tolstoy",
    "Leonid Andreyev",
    "Lewis Carroll",
    "Louis-Ferdinand Céline",
    "Luigi Pirandello",
    "Luís de Camões",
    "Léon Bloy",
    "Marcel Proust",
    "Marguerite Duras",
    "Mario Vargas Llosa",
    "Mark Twain",
    "Michel Houellebecq",
    "Michel de Montaigne",
    "Miguel de Cervantes",
    "Miguel de Unamuno",
    "Mikhail Bulgakov",
    "Mikhail Lermontov",
    "Molière",
    "Murasaki Shikibu",
    "Naguib Mahfouz",
    "Nathaniel Hawthorne",
    "Natsume Sōseki",
    "Nikolai Gogol",
    "Octavio Paz",
    "Osamu Dazai",
    "Oscar Wilde",
    "Paul Valéry",
    "Paul Verlaine",
    "Peter Handke",
    "Philip Roth",
    "Primo Levi",
    "Ralph Waldo Emerson",
    "Ray Bradbury",
    "Raymond Chandler",
    "Robert Frost",
    "Robert Louis Stevenson",
    "Robert Musil",
    "Roberto Bolaño",
    "Roland Barthes",
    "Ryūnosuke Akutagawa",
    "Samuel Beckett",
    "Samuel Johnson",
    "Saul Bellow",
    "Sei Shōnagon",
    "Sidonie-Gabrielle Colette",
    "Sophocles",
    "Stefan Zweig",
    "Stendhal",
    "Stéphane Mallarmé",
    "Sylvia Plath",
    "T.S. Eliot",
    "Thomas Hardy",
    "Thomas Mann",
    "Victor Hugo",
    "Virgil",
    "Virginia Woolf",
    "Vladimir Nabokov",
    "Voltaire",
    "W. B. Yeats",
    "W. H. Auden",
    "Walt Whitman",
    "Walter Scott",
    "William Carlos Williams",
    "William Faulkner",
    "William James",
    "William Shakespeare",
    "Yasunari Kawabata",
    "Yukio Mishima",
    "Émile Zola",
    "Edmund Spenser",
    "John Donne",
    "William Blake",
    "John Synge",
    "Aeschylus",
    "Ovid",
    "Natsume Soseki",
    "Laslo Krasznahorkai",
    "Friedrich Holderlin",
    "Rainer Marie Rilke",
    "Thomas Bernhard",
    "WG Sebald",
    "Heinrich von Kleist",
    "David Foster Wallace",
    "Stephen King"
]

// ----------------------------------------------------
// Configuration
// ----------------------------------------------------
const WIKIPEDIA_API = "https://en.wikipedia.org/w/api.php"

async function fetchImageForAuthor(name) {
    try {
        const url = `${WIKIPEDIA_API}?action=query&titles=${encodeURIComponent(name)}&prop=pageimages&format=json&pithumbsize=600&origin=*`
        const response = await fetch(url)
        const data = await response.json()

        const pages = data.query.pages
        const pageId = Object.keys(pages)[0]

        if (pageId === "-1") {
            console.error(`[!] No Wikipedia page found for: ${name}`)
            return null
        }

        const page = pages[pageId]
        if (page.thumbnail && page.thumbnail.source) {
            console.error(`[+] Found image for: ${name}`)
            return page.thumbnail.source
        } else {
            console.error(`[-] No image found on page for: ${name}`)
            return null
        }
    } catch (error) {
        console.error(`[x] Error fetching ${name}:`, error.message)
        return null
    }
}

async function generateSQL() {
    console.error("-- Generating SQL for adding authors...\n")

    const values = []

    for (const name of authorsList) {
        const imageUrl = await fetchImageForAuthor(name)
        // Wikipedia API has rate limits, let's be polite (optional, but good practice)
        // await new Promise(r => setTimeout(r, 100)) 

        // Escape single quotes for SQL
        const safeName = name.replace(/'/g, "''")
        const safeUrl = imageUrl ? `'${imageUrl}'` : 'NULL'

        values.push(`('${safeName}', ${safeUrl})`)
    }

    const sql = `
    INSERT INTO authors (name, image_url)
    VALUES 
    ${values.join(',\n    ')};
  `

    console.log(sql)
}

generateSQL()
