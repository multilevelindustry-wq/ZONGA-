

const zongaFashionCategories = [

    {
        name: "Men's Fashion",
        image: "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&w=1000&q=85"
    },

    {
        name: "Women's Fashion",
        image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=85"
    },

    {
        name: "Children's Fashion",
        image: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=1000&q=85"
    },

    {
        name: "Shoes",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=85"
    },

    {
        name: "Sneakers",
        image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1000&q=85"
    },

    {
        name: "Bags",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=85"
    },

    {
        name: "Watches",
        image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=85"
    },

    {
        name: "Jewelry",
        image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1000&q=85"
    },

    {
        name: "Sunglasses",
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=85"
    },

    {
        name: "Underwear",
        image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=1000&q=85"
    },

    {
        name: "Beauty",
        image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1000&q=85"
    },

    {
        name: "Skincare",
        image: "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=1000&q=85"
    },

    {
        name: "Makeup",
        image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=85"
    },

    {
        name: "Perfumes",
        image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1000&q=85"
    },

    {
        name: "Hair Care",
        image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=85"
    }

];


function startZongaCategoryMovie(container) {

    let currentIndex = 0;


    function showCategory() {

        const category =
            zongaFashionCategories[currentIndex];


        container.innerHTML = `

            <a href="category.html">

                <div class="zonga-category-movie-card">

                    <img
                        src="${category.image}"
                        alt="${category.name}"
                    >

                    <div class="zonga-category-movie-overlay">

                        <span class="zonga-category-movie-label">
                            EXPLORE ZONGA
                        </span>

                        <h3 class="zonga-category-movie-title">
                            ${category.name}
                        </h3>

                        <div class="zonga-category-movie-text">
                            Discover products in this category →
                        </div>

                    </div>

                </div>

            </a>

        `;


        currentIndex++;

        if (
            currentIndex >=
            zongaFashionCategories.length
        ) {
            currentIndex = 0;
        }

    }


    showCategory();


    setInterval(
        showCategory,
        5000
    );

}


document
    .querySelectorAll(".zonga-category-movie")
    .forEach(
        startZongaCategoryMovie
    );


