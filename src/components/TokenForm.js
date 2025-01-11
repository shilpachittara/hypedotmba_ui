import { useState } from "react";

export default function TokenForm() {
  const [form, setForm] = useState({ name: "", symbol: "", description: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Token Created:", form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="text" name="name" placeholder="Token Name" onChange={handleChange} className="w-full p-2 border rounded" />
      <input type="text" name="symbol" placeholder="Token Symbol" onChange={handleChange} className="w-full p-2 border rounded" />
      <textarea name="description" placeholder="Token Description" onChange={handleChange} className="w-full p-2 border rounded" />
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Launch Token</button>
    </form>
  );
}