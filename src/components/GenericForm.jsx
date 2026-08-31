export function GenericForm({ descriptor }) {
    return (
        <form>
            {descriptor.fields.map((field) => (
                <div key={field.name}>
                    <label>{field.label}</label>
                    <input
                        type={field.type}
                        name={field.name}
                    />
                </div>
            ))}
        </form>
    );
}