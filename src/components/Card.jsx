export default function Card({ title, description, image }) {
  return (
    <div className="bg-white rounded-2xl shadow p-4 hover:shadow-lg transition duration-300">
      {image && (
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover rounded-t-xl mb-4"
        />
      )}
      <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}