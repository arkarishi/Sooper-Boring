// Theories.jsx
import React from "react";

const Theories = () => {
  const theories = [
    {
      title: "Theory of Relativity",
      description: "Einstein’s groundbreaking theory explaining how time and space are linked."
    },
    {
      title: "Quantum Mechanics",
      description: "A fundamental theory in physics that describes nature at the smallest scales."
    },
    {
      title: "Evolution",
      description: "Darwin’s theory explaining the process of natural selection and evolution of species."
    }
  ];

  return (
    <div className="min-h-screen w-screen bg-white p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Theories</h1>
      <div className="grid gap-4">
        {theories.map((theory, index) => (
          <div key={index} className="p-4 border rounded shadow-sm hover:shadow-md">
            <h2 className="text-xl font-semibold mb-2">{theory.title}</h2>
            <p className="text-gray-700">{theory.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Theories;