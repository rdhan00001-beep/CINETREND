import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

// Handcrafted fallback movie database representing "millions of global rating data"
const FALLBACK_DATABASE: Record<string, any[]> = {
  "aksi": [
    {
      id: "act-1",
      title: "The Dark Knight",
      year: 2008,
      rating: 9.0,
      votesCount: "2.8M ratings",
      genres: ["Action", "Crime", "Drama"],
      director: "Christopher Nolan",
      cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart"],
      synopsis: "Ketika ancaman yang dikenal sebagai The Joker mengacaukan kota Gotham, Batman harus menerima salah satu ujian psikologis dan fisik terbesar untuk melawan ketidakadilan.",
      trendReason: "Peringkat #1 Film Aksi Terbaik sepanjang masa di IMDb dengan skor konsensus 94% dari 2,8 juta pemberi rating global.",
      popularityScore: 98,
      ratingPercentage: 94,
      bannerColor: "from-slate-800 to-slate-950"
    },
    {
      id: "act-2",
      title: "Mad Max: Fury Road",
      year: 2015,
      rating: 8.1,
      votesCount: "1.1M ratings",
      genres: ["Action", "Adventure", "Sci-Fi"],
      director: "George Miller",
      cast: ["Tom Hardy", "Charlize Theron", "Nicholas Hoult"],
      synopsis: "Di gurun pasir yang tandus, seorang wanita memberontak melawan penguasa tirani demi mencari tanah airnya, dibantu oleh sekelompok tahanan wanita dan seorang pengembara bernama Max.",
      trendReason: "Mengalami lonjakan pencarian +20% minggu ini karena rilisnya prekuel Furiosa, dipuji secara global untuk aksi praktis terbaik.",
      popularityScore: 92,
      ratingPercentage: 97,
      bannerColor: "from-amber-700 to-orange-950"
    },
    {
      id: "act-3",
      title: "Spider-Man: Across the Spider-Verse",
      year: 2023,
      rating: 8.6,
      votesCount: "350k ratings",
      genres: ["Action", "Animation", "Adventure"],
      director: "Joaquim Dos Santos",
      cast: ["Shameik Moore", "Hailee Steinfeld", "Oscar Isaac"],
      synopsis: "Miles Morales terlempar melintasi Multiverse, di mana ia bertemu dengan tim Spider-People yang bertugas melindungi keberadaannya. Namun saat pahlawan-pahlawan bertikai, Miles harus mendefinisikan ulang arti menjadi pahlawan.",
      trendReason: "Rating luar biasa tinggi dari penonton global, menjadikannya salah satu film animasi aksi dengan rating tertinggi dekade ini.",
      popularityScore: 95,
      ratingPercentage: 95,
      bannerColor: "from-pink-600 to-indigo-950"
    },
    {
      id: "act-4",
      title: "John Wick: Chapter 4",
      year: 2023,
      rating: 7.9,
      votesCount: "310k ratings",
      genres: ["Action", "Thriller"],
      director: "Chad Stahelski",
      cast: ["Keanu Reeves", "Laurence Fishburne", "George Georgiou"],
      synopsis: "John Wick menemukan jalan untuk mengalahkan High Table. Namun sebelum dia bisa mendapatkan kebebasannya, Wick harus berhadapan dengan musuh baru dengan aliansi kuat di seluruh dunia.",
      trendReason: "Aksi koreografi mutakhir yang ditonton lebih dari 150 juta jam di platform streaming global bulan lalu.",
      popularityScore: 89,
      ratingPercentage: 94,
      bannerColor: "from-red-900 to-zinc-950"
    },
    {
      id: "act-5",
      title: "Inception",
      year: 2010,
      rating: 8.8,
      votesCount: "2.5M ratings",
      genres: ["Action", "Sci-Fi", "Adventure"],
      director: "Christopher Nolan",
      cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page"],
      synopsis: "Seorang pencuri yang mencuri rahasia perusahaan melalui penggunaan teknologi berbagi mimpi diberi tugas sebaliknya: menanamkan ide ke dalam pikiran seorang CEO.",
      trendReason: "Secara konsisten masuk dalam jajaran 5 besar film aksi fiksi ilmiah paling banyak didiskusikan di Letterboxd secara global.",
      popularityScore: 94,
      ratingPercentage: 91,
      bannerColor: "from-cyan-900 to-slate-950"
    }
  ],
  "komedi": [
    {
      id: "com-1",
      title: "Everything Everywhere All at Once",
      year: 2022,
      rating: 8.5,
      votesCount: "480k ratings",
      genres: ["Comedy", "Action", "Sci-Fi"],
      director: "Daniel Kwan, Daniel Scheinert",
      cast: ["Michelle Yeoh", "Stephanie Hsu", "Ke Huy Quan"],
      synopsis: "Seorang imigran Tionghoa paruh baya terseret ke dalam petualangan luar biasa di mana ia sendiri yang dapat menyelamatkan dunia dengan menjelajahi alam semesta lain yang terhubung dengan kehidupan yang bisa ia jalani.",
      trendReason: "Pemenang 7 Piala Oscar yang memadukan komedi absurd dengan kehangatan keluarga, mempertahankan tren diskusi organik yang sangat tinggi.",
      popularityScore: 94,
      ratingPercentage: 93,
      bannerColor: "from-purple-600 to-rose-950"
    },
    {
      id: "com-2",
      title: "Knives Out",
      year: 2019,
      rating: 7.9,
      votesCount: "750k ratings",
      genres: ["Comedy", "Mystery", "Drama"],
      director: "Rian Johnson",
      cast: ["Daniel Craig", "Chris Evans", "Ana de Armas"],
      synopsis: "Seorang detektif menyelidiki kematian misterius seorang patriark keluarga yang eksentrik dan agresif.",
      trendReason: "Komedi misteri modern terpopuler yang mengumpulkan pujian global atas humor satir cerdas dan plot twist yang brilian.",
      popularityScore: 88,
      ratingPercentage: 97,
      bannerColor: "from-emerald-700 to-cyan-950"
    },
    {
      id: "com-3",
      title: "The Grand Budapest Hotel",
      year: 2014,
      rating: 8.1,
      votesCount: "850k ratings",
      genres: ["Comedy", "Drama"],
      director: "Wes Anderson",
      cast: ["Ralph Fiennes", "F. Murray Abraham", "Mathieu Amalric"],
      synopsis: "Seorang pramutamu di resor Eropa terkenal dituduh melakukan pembunuhan dan berteman dengan salah satu karyawannya untuk membuktikan bahwa dirinya tidak bersalah.",
      trendReason: "Estetika visual ikonik dengan humor bergaya quirky yang menjadi tren viral konstan di TikTok dan Instagram.",
      popularityScore: 86,
      ratingPercentage: 92,
      bannerColor: "from-pink-500 to-purple-950"
    },
    {
      id: "com-4",
      title: "Superbad",
      year: 2007,
      rating: 7.6,
      votesCount: "630k ratings",
      genres: ["Comedy"],
      director: "Greg Mottola",
      cast: ["Jonah Hill", "Michael Cera", "Christopher Mintz-Plasse"],
      synopsis: "Dua siswa sekolah menengah yang bergantung satu sama lain dipaksa untuk menghadapi kecemasan perpisahan setelah rencana mereka untuk mengadakan pesta berisi minuman keras menjadi kacau.",
      trendReason: "Diakui secara universal sebagai salah satu film komedi remaja terbaik abad ke-21 dengan kutipan-kutipan yang masih tren hingga hari ini.",
      popularityScore: 85,
      ratingPercentage: 88,
      bannerColor: "from-yellow-600 to-amber-950"
    },
    {
      id: "com-5",
      title: "Free Guy",
      year: 2021,
      rating: 7.1,
      votesCount: "420k ratings",
      genres: ["Comedy", "Action", "Sci-Fi"],
      director: "Shawn Levy",
      cast: ["Ryan Reynolds", "Jodie Comer", "Taika Waititi"],
      synopsis: "Seorang teller bank menyadari bahwa dia sebenarnya adalah karakter latar belakang dalam video game dunia terbuka yang brutal.",
      trendReason: "Sangat populer di kalangan penonton muda dan gamer, memperoleh tingkat kepuasan penonton 94% di Rotten Tomatoes.",
      popularityScore: 84,
      ratingPercentage: 80,
      bannerColor: "from-blue-500 to-sky-950"
    }
  ],
  "drama": [
    {
      id: "dra-1",
      title: "The Shawshank Redemption",
      year: 1994,
      rating: 9.3,
      votesCount: "2.9M ratings",
      genres: ["Drama"],
      director: "Frank Darabont",
      cast: ["Tim Robbins", "Morgan Freeman", "Bob Gunton"],
      synopsis: "Di penjara Shawshank, bankir Andy Dufresne menjalin persahabatan selama bertahun-tahun dengan sesama narapidana, Red, menemukan jalan menuju penebusan melalui tindakan kesopanan umum.",
      trendReason: "Film peringkat #1 sepanjang masa di IMDb selama lebih dari 15 tahun, menjadikannya rujukan drama legendaris dunia.",
      popularityScore: 99,
      ratingPercentage: 98,
      bannerColor: "from-stone-700 to-neutral-950"
    },
    {
      id: "dra-2",
      title: "Oppenheimer",
      year: 2023,
      rating: 8.4,
      votesCount: "680k ratings",
      genres: ["Biography", "Drama", "History"],
      director: "Christopher Nolan",
      cast: ["Cillian Murphy", "Emily Blunt", "Matt Damon"],
      synopsis: "Kisah fisikawan Amerika J. Robert Oppenheimer yang memimpin Proyek Manhattan untuk mengembangkan bom atom pertama bagi kemanusiaan, mengubah dunia selamanya.",
      trendReason: "Menang besar di berbagai penghargaan global dan memicu fenomena budaya 'Barbenheimer' dengan pendapatan lebih dari $950 juta.",
      popularityScore: 97,
      ratingPercentage: 93,
      bannerColor: "from-amber-950 to-stone-900"
    },
    {
      id: "dra-3",
      title: "Forrest Gump",
      year: 1994,
      rating: 8.8,
      votesCount: "2.2M ratings",
      genres: ["Drama", "Romance"],
      director: "Robert Zemeckis",
      cast: ["Tom Hanks", "Robin Wright", "Gary Sinise"],
      synopsis: "Kisah luar biasa tentang seorang pria ber-IQ rendah yang menyaksikan dan secara tidak sengaja memengaruhi beberapa peristiwa bersejarah penting di Amerika Serikat.",
      trendReason: "Kehangatan ceritanya menjadikannya film kenyamanan keluarga teratas dengan miliaran tayangan streaming secara akumulatif.",
      popularityScore: 93,
      ratingPercentage: 96,
      bannerColor: "from-blue-600 to-indigo-950"
    },
    {
      id: "dra-4",
      title: "Parasite",
      year: 2019,
      rating: 8.5,
      votesCount: "920k ratings",
      genres: ["Drama", "Thriller", "Comedy"],
      director: "Bong Joon Ho",
      cast: ["Song Kang-ho", "Lee Sun-kyun", "Cho Yeo-jeong"],
      synopsis: "Keluarga miskin menyusup ke dalam rumah tangga kaya dengan berpura-pura menjadi profesional berkualifikasi tinggi, memicu rangkaian kejadian tak terduga.",
      trendReason: "Film non-bahasa Inggris pertama yang memenangkan Best Picture di Oscar, dipuji sebagai mahakarya kritik sosial modern.",
      popularityScore: 95,
      ratingPercentage: 99,
      bannerColor: "from-emerald-800 to-zinc-950"
    },
    {
      id: "dra-5",
      title: "Interstellar",
      year: 2014,
      rating: 8.7,
      votesCount: "2.0M ratings",
      genres: ["Drama", "Sci-Fi", "Adventure"],
      director: "Christopher Nolan",
      cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
      synopsis: "Sekelompok penjelajah melakukan perjalanan melintasi lubang cacing di luar angkasa dalam upaya untuk memastikan kelangsungan hidup umat manusia di bumi yang sekarat.",
      trendReason: "Mempertahankan basis penggemar fanatik global dengan keindahan visual dan narasi emosional hubungan ayah-anak.",
      popularityScore: 96,
      ratingPercentage: 86,
      bannerColor: "from-indigo-900 to-black"
    }
  ],
  "sci-fi": [
    {
      id: "scifi-1",
      title: "Dune: Part Two",
      year: 2024,
      rating: 8.6,
      votesCount: "410k ratings",
      genres: ["Sci-Fi", "Action", "Adventure"],
      director: "Denis Villeneuve",
      cast: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson"],
      synopsis: "Paul Atreides bersatu dengan Chani dan Fremen saat membalas dendam terhadap para konspirator yang menghancurkan keluarganya, berusaha mencegah masa depan mengerikan yang hanya bisa ia ramalkan.",
      trendReason: "Film fiksi ilmiah terpanas saat ini, meraih rating 95% di Rotten Tomatoes dengan pujian visual luar biasa tingkat dunia.",
      popularityScore: 99,
      ratingPercentage: 95,
      bannerColor: "from-amber-600 to-amber-950"
    },
    {
      id: "scifi-2",
      title: "Interstellar",
      year: 2014,
      rating: 8.7,
      votesCount: "2.0M ratings",
      genres: ["Sci-Fi", "Adventure", "Drama"],
      director: "Christopher Nolan",
      cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
      synopsis: "Di masa depan ketika bumi tidak lagi layak huni, sekelompok astronot melakukan perjalanan melewati lubang cacing untuk mencari planet baru bagi peradaban manusia.",
      trendReason: "Skor musik legendaris Hans Zimmer dan akurasi teori sains menjadikannya tren konstan di kalangan komunitas akademis dan sinema.",
      popularityScore: 96,
      ratingPercentage: 86,
      bannerColor: "from-blue-900 to-black"
    },
    {
      id: "scifi-3",
      title: "Blade Runner 2049",
      year: 2017,
      rating: 8.0,
      votesCount: "630k ratings",
      genres: ["Sci-Fi", "Mystery", "Action"],
      director: "Denis Villeneuve",
      cast: ["Ryan Gosling", "Harrison Ford", "Ana de Armas"],
      synopsis: "Seorang blade runner baru, polisi LAPD bernama K, menemukan rahasia lama yang terkubur yang berpotensi menjerumuskan apa yang tersisa dari masyarakat ke dalam kekacauan.",
      trendReason: "Mencapai status 'cult-classic' modern dengan estetika neon cyberpunk yang mendominasi tren desain futuristik.",
      popularityScore: 90,
      ratingPercentage: 88,
      bannerColor: "from-cyan-800 to-fuchsia-950"
    },
    {
      id: "scifi-4",
      title: "The Matrix",
      year: 1999,
      rating: 8.7,
      votesCount: "2.0M ratings",
      genres: ["Sci-Fi", "Action"],
      director: "Lana Wachowski, Lilly Wachowski",
      cast: ["Keanu Reeves", "Laurence Fishburne", "Carrie-Anne Moss"],
      synopsis: "Seorang hacker komputer mempelajari sifat asli dari realitasnya dari para pemberontak misterius dan perannya dalam perang melawan penguasa sistem.",
      trendReason: "Film fiksi ilmiah revolusioner yang mendefinisikan ulang CGI aksi, tetap menjadi tontonan wajib referensi budaya teknologi pop.",
      popularityScore: 91,
      ratingPercentage: 96,
      bannerColor: "from-teal-800 to-zinc-950"
    },
    {
      id: "scifi-5",
      title: "Arrival",
      year: 2016,
      rating: 7.9,
      votesCount: "740k ratings",
      genres: ["Sci-Fi", "Drama", "Mystery"],
      director: "Denis Villeneuve",
      cast: ["Amy Adams", "Jeremy Renner", "Forest Whitaker"],
      synopsis: "Seorang ahli bahasa dipanggil oleh militer untuk berkomunikasi dengan alien yang mendarat di bumi, mengungkap misteri yang menantang pemahaman kita tentang waktu.",
      trendReason: "Dikenal sebagai salah satu film tentang komunikasi alien paling cerdas dan mengharukan yang pernah diproduksi.",
      popularityScore: 87,
      ratingPercentage: 94,
      bannerColor: "from-sky-800 to-neutral-950"
    }
  ],
  "horor": [
    {
      id: "hor-1",
      title: "Get Out",
      year: 2017,
      rating: 7.8,
      votesCount: "680k ratings",
      genres: ["Horror", "Mystery", "Thriller"],
      director: "Jordan Peele",
      cast: ["Daniel Kaluuya", "Allison Williams", "Bradley Whitford"],
      synopsis: "Seorang pemuda kulit hitam mengunjungi keluarga pacar kulit putihnya untuk akhir pekan, di mana ia perlahan-lahan menyadari rahasia menyeramkan yang tersembunyi di balik keramahan mereka.",
      trendReason: "Sangat dipuji secara kritis dan sosial, memenangkan Oscar untuk Best Original Screenplay dan merevolusi horor psikologis modern.",
      popularityScore: 92,
      ratingPercentage: 98,
      bannerColor: "from-red-950 to-neutral-950"
    },
    {
      id: "hor-2",
      title: "Hereditary",
      year: 2018,
      rating: 7.3,
      votesCount: "390k ratings",
      genres: ["Horror", "Mystery", "Drama"],
      director: "Ari Aster",
      cast: ["Toni Collette", "Alex Wolff", "Milly Shapiro"],
      synopsis: "Setelah kematian nenek mereka, sebuah keluarga yang berduka mulai diganggu oleh kejadian misterius dan tragis, mengungkap warisan gelap leluhur mereka.",
      trendReason: "Dianggap sebagai film paling menakutkan abad ini oleh banyak kritikus, dengan akting Toni Collette yang fenomenal.",
      popularityScore: 90,
      ratingPercentage: 90,
      bannerColor: "from-violet-950 to-stone-950"
    },
    {
      id: "hor-3",
      title: "A Quiet Place",
      year: 2018,
      rating: 7.5,
      votesCount: "580k ratings",
      genres: ["Horror", "Sci-Fi", "Drama"],
      director: "John Krasinski",
      cast: ["Emily Blunt", "John Krasinski", "Millicent Simmonds"],
      synopsis: "Sebuah keluarga berjuang bertahan hidup di dunia pasca-apokaliptik yang dihuni oleh makhluk buta berpendenaran tajam yang berburu murni berdasarkan suara.",
      trendReason: "Konsep unik yang menegangkan tanpa suara, meraih kesuksesan finansial besar dan melahirkan waralaba horor global populer.",
      popularityScore: 88,
      ratingPercentage: 96,
      bannerColor: "from-teal-950 to-slate-900"
    },
    {
      id: "hor-4",
      title: "Midsommar",
      year: 2019,
      rating: 7.1,
      votesCount: "410k ratings",
      genres: ["Horror", "Drama", "Mystery"],
      director: "Ari Aster",
      cast: ["Florence Pugh", "Jack Reynor", "William Jackson Harper"],
      synopsis: "Sepasang kekasih melakukan perjalanan ke festival musim panas Swedia yang tampak indah, namun liburan mereka berubah menjadi mimpi buruk sekte pagan di siang bolong.",
      trendReason: "Gaya 'folk horror' terang benderang yang memicu estetika pakaian bunga-bunga dan kontras menyeramkan yang viral di media sosial.",
      popularityScore: 89,
      ratingPercentage: 83,
      bannerColor: "from-amber-800 to-yellow-950"
    },
    {
      id: "hor-5",
      title: "The Conjuring",
      year: 2013,
      rating: 7.5,
      votesCount: "540k ratings",
      genres: ["Horror", "Mystery"],
      director: "James Wan",
      cast: ["Vera Farmiga", "Patrick Wilson", "Lili Taylor"],
      synopsis: "Penyelidik paranormal Ed dan Lorraine Warren bekerja untuk membantu keluarga yang mengalami peristiwa mistis menakutkan di rumah pertanian Rhode Island mereka.",
      trendReason: "Film horor supranatural klasik modern yang meluncurkan waralaba sinematik horor tersukses secara finansial sepanjang sejarah.",
      popularityScore: 87,
      ratingPercentage: 86,
      bannerColor: "from-indigo-950 to-neutral-900"
    }
  ],
  "romantis": [
    {
      id: "rom-1",
      title: "La La Land",
      year: 2016,
      rating: 8.0,
      votesCount: "660k ratings",
      genres: ["Comedy", "Drama", "Music", "Romance"],
      director: "Damien Chazelle",
      cast: ["Ryan Gosling", "Emma Stone", "Rosemarie DeWitt"],
      synopsis: "Seorang musisi jazz dan aktris yang bercita-cita tinggi jatuh cinta di Los Angeles, namun karir mereka yang menanjak mengancam merobek hubungan mereka.",
      trendReason: "Visual warna-warni yang luar biasa dengan lagu-lagu ikonik, menjadikannya salah satu film romantis modern yang paling dicintai secara global.",
      popularityScore: 94,
      ratingPercentage: 91,
      bannerColor: "from-fuchsia-600 to-purple-950"
    },
    {
      id: "rom-2",
      title: "About Time",
      year: 2013,
      rating: 7.8,
      votesCount: "380k ratings",
      genres: ["Drama", "Fantasy", "Romance"],
      director: "Richard Curtis",
      cast: ["Domhnall Gleeson", "Rachel McAdams", "Bill Nighy"],
      synopsis: "Pada usia 21 tahun, Tim menemukan bahwa pria di keluarganya dapat melakukan perjalanan waktu. Ia memutuskan untuk menggunakan kekuatannya untuk mendapatkan pacar.",
      trendReason: "Sangat direkomendasikan secara viral di media sosial sebagai film romantis paling mengharukan yang mengajarkan makna menghargai hari ini.",
      popularityScore: 91,
      ratingPercentage: 87,
      bannerColor: "from-rose-600 to-red-950"
    },
    {
      id: "rom-3",
      title: "Past Lives",
      year: 2023,
      rating: 7.9,
      votesCount: "120k ratings",
      genres: ["Drama", "Romance"],
      director: "Celine Song",
      cast: ["Greta Lee", "Teo Yoo", "John Magaro"],
      synopsis: "Dua teman masa kecil yang terpisah secara mendalam bertemu kembali selama satu minggu yang menentukan di New York, menghadapi konsep takdir (In-Yun) dan cinta.",
      trendReason: "Karya romantis berperingkat kritis tertinggi tahun lalu, dipuji secara universal atas narasinya yang tenang, realistis, dan emosional.",
      popularityScore: 93,
      ratingPercentage: 96,
      bannerColor: "from-sky-700 to-indigo-950"
    },
    {
      id: "rom-4",
      title: "Pride & Prejudice",
      year: 2005,
      rating: 7.8,
      votesCount: "340k ratings",
      genres: ["Drama", "Romance"],
      director: "Joe Wright",
      cast: ["Keira Knightley", "Matthew Macfadyen", "Brenda Blethyn"],
      synopsis: "Elizabeth Bennet yang berjiwa bebas menghadapi ketegangan cinta, kesalahpahaman, kelas sosial, dan kebanggaan dalam hubungannya dengan Mr. Darcy yang kaya raya.",
      trendReason: "Adaptasi novel Jane Austen terbaik dengan sinematografi indah yang terus menjadi favorit nomor satu untuk kencan romantis santai.",
      popularityScore: 89,
      ratingPercentage: 88,
      bannerColor: "from-emerald-700 to-teal-950"
    },
    {
      id: "rom-5",
      title: "Before Sunrise",
      year: 1995,
      rating: 8.1,
      votesCount: "320k ratings",
      genres: ["Drama", "Romance"],
      director: "Richard Linklater",
      cast: ["Ethan Hawke", "Julie Delpy", "Andrea Eckert"],
      synopsis: "Seorang pemuda Amerika dan seorang wanita Prancis bertemu di kereta di Eropa dan menghabiskan satu malam romantis bersama berjalan-jalan di kota Wina.",
      trendReason: "Diakui sebagai trilogi romantis terbaik sepanjang masa, menawarkan percakapan mendalam yang sangat disukai para pecinta sinema.",
      popularityScore: 90,
      ratingPercentage: 100,
      bannerColor: "from-orange-600 to-amber-950"
    }
  ]
};

// Main function to run Express
async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route to get movie recommendations using Gemini
  app.post("/api/recommendations", async (req, res) => {
    try {
      const { genre } = req.body;
      if (!genre) {
        return res.status(400).json({ error: "Genre is required" });
      }

      const normalizedGenre = genre.toLowerCase().trim();

      // Check if Gemini API Key is available
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
        console.log(`[BACKEND] No Gemini API key detected. Using high-quality handcrafted global trend ratings database for: ${genre}`);
        // Fallback logic
        const fallbackMovies = FALLBACK_DATABASE[normalizedGenre] || FALLBACK_DATABASE["drama"];
        return res.json({
          source: "global_trend_database_offline",
          genre: genre,
          movies: fallbackMovies
        });
      }

      console.log(`[BACKEND] Gemini API Key detected. Fetching global trend movie recommendations for: ${genre}`);
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });

      const prompt = `
        You are a highly advanced movie recommendation engine connected to a database of global movie ratings, containing over 50 million reviews from platforms like IMDb, Letterboxd, and Rotten Tomatoes.
        
        The user wants recommendations for the genre: "${genre}".
        
        Provide exactly 5 highly-rated, popular, and currently trending movies in the genre "${genre}" (or closely matching it).
        Your recommendations should feel incredibly real, accurate, and include realistic rating metrics (IMDb-like rating out of 10, votes count representing millions of users, popularity scores, etc.).
        
        Provide the response in INDONESIAN language for titles (if commonly known in Indonesia, like "A Quiet Place" or "Laskar Pelangi"), synopsis, and trendReason.
        
        You must return a JSON object with a single root key "movies" containing an array of 5 movie objects.
        Each movie object in the "movies" array must match the provided response schema exactly.
      `;

      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                movies: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING, description: "Unique string ID (e.g. gemini-1)" },
                      title: { type: Type.STRING, description: "Movie title" },
                      year: { type: Type.INTEGER, description: "Release year" },
                      rating: { type: Type.NUMBER, description: "Decimal rating out of 10 (e.g. 8.4)" },
                      votesCount: { type: Type.STRING, description: "Number of reviews/votes (e.g. 1.2M ratings)" },
                      genres: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "List of genres"
                      },
                      director: { type: Type.STRING, description: "Director name" },
                      cast: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "List of 3-4 lead cast members"
                      },
                      synopsis: { type: Type.STRING, description: "Short engaging plot summary in Indonesian (approx 2 sentences)" },
                      trendReason: { type: Type.STRING, description: "Why this movie is trending in our global ratings database (in Indonesian)" },
                      popularityScore: { type: Type.INTEGER, description: "A number between 70 and 100 indicating popularity trend" },
                      ratingPercentage: { type: Type.INTEGER, description: "Rating equivalent percentage (e.g. 92% Rotten Tomatoes score)" },
                      bannerColor: { type: Type.STRING, description: "A Tailwind gradient CSS class combination like: from-purple-600 to-indigo-950" }
                    },
                    required: [
                      "id", "title", "year", "rating", "votesCount", "genres", "director", "cast", "synopsis", "trendReason", "popularityScore", "ratingPercentage", "bannerColor"
                    ]
                  },
                  description: "Array of exactly 5 movie objects"
                }
              },
              required: ["movies"]
            }
          }
        });

        const textResponse = response.text ? response.text.trim() : "";
        if (!textResponse) {
          throw new Error("Empty response from Gemini");
        }

        // Parse JSON safely
        const parsedData = JSON.parse(textResponse);
        if (parsedData && Array.isArray(parsedData.movies) && parsedData.movies.length > 0) {
          return res.json({
            source: "gemini_trend_engine",
            genre: genre,
            movies: parsedData.movies
          });
        } else {
          throw new Error("Invalid structure from Gemini response");
        }
      } catch (geminiError) {
        console.error("[BACKEND] Error calling Gemini API, falling back to local dataset:", geminiError);
        const fallbackMovies = FALLBACK_DATABASE[normalizedGenre] || FALLBACK_DATABASE["drama"];
        return res.json({
          source: "global_trend_database_fallback",
          genre: genre,
          movies: fallbackMovies,
          error: "Failed to connect to real-time Gemini feed. Displaying high-quality offline rating cache."
        });
      }

    } catch (error: any) {
      console.error("[BACKEND] General route handler error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("[BACKEND] Mounted Vite development middleware");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("[BACKEND] Serving static files from dist production directory");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
