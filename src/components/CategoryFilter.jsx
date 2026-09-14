export default function CategoryFilter({ products, setFilteredProducts }) {
    function handleCategoryChange(event) {
        const category = event.target.value;

        if (category === "all") {
            setFilteredProducts(products);
            return;
        }

        const filtered = products.filter(
            (product) => product.category === category
        );

        setFilteredProducts(filtered);
    }

    return (
        <div className="category-filter">
            <label htmlFor="category">Kategori:</label>

            <select id="category" onChange={handleCategoryChange}>
                <option value="all">Alla kategorier</option>
                <option value="electronics">Elektronik</option>
                <option value="furniture">Möbler</option>
                <option value="accessories">Tillbehör</option>
                <option value="food">Mat</option>
            </select>
        </div>
    );
}