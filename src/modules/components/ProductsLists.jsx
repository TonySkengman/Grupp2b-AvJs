export default function ProductsLists({ products }) {
    return <> {
        products.map(p => {
            return <div key={p.id} className="product-card">
                <h3>{p.name}</h3>
            </div>
        })
    } </>
}
