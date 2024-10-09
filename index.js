import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";

dotenv.config();

const app = express();
app.use(express.json());
app.use(morgan("dev")); // Use morgan to log requests
app.use(helmet()); // Use helmet to secure HTTP headers

const port = process.env.PORT || 3000;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase URL or Key is missing. Please check your .env file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

app.get("/", (req, res) => {
  res.send("Welcome to the Shopping List API");
});

// on separate postman tab do the post request
// POST / ADD AN ITEM
app.post("/shopping-list/item", async (req, res) => {
  // req.body.name

  // destructuring from req.body object
  const { name, category, price, quantity, expiryDate } = req.body;

  // create an object to insert in the database
  const newItem = { name, category, price, quantity, expiryDate };
  // in postman
  // {
  //     "name": "basil",
  //     "category": "herb",
  //     "price": "1.00",
  //     "quantity": "1",
  //     "expiryDate": "2024-10-17"
  // }

  console.log("New item to insert:", newItem);

  // insert new item into the supabase database

  const { data: insertedItem, error } = await supabase
    .from("shopping_list")
    .insert([newItem])
    .select();

  if (error) {
    console.error(`Error inserting item: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }

  if (!insertedItem || insertedItem.length === 0) {
    console.error("No data returned after insertion");
    return res.status(500).json({ error: "No data returned after insertion" });
  }
  console.log("Inserted item:", insertedItem);
  res.status(201).json(insertedItem[0]);
});

// on separate postman tab do get request
// get all the items in the shopping list
app.get("/shopping-list/items", async (req, res) => {
  const { data: items, error } = await supabase
    .from("shopping_list")
    .select("*")
    .order("expiryDate", { ascending: true });

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(200).json(items);
});

// get one item with an id
app.get("/shopping-list/items/:id", async (req, res) => {
  const id = Number(req.params.id);
  // .find - first element in the array

  const { data: item, error } = await supabase
    .from("shopping_list")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    res.status(404).send(`Item with id ${id} not found`);
  } else {
    res.status(200).json(item);
  }
});

// PUT - UPDATE an item

app.put("/shopping-list/items/:id", async (req, res) => {
  const { id } = req.params;
  const { name, category, price, quantity, expiryDate } = req.body;

  // update the item in the supabase database
  const { data: updatedItem, error } = await supabase
    .from("shopping_list")
    .update({ name, category, price, quantity, expiryDate })
    .eq("id", id)
    .select(); // Ensure we select the updated item

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json(updatedItem);
});

// DELETE

app.delete("/shopping-list/items/:id", async (req, res) => {
  const { id } = req.params;

  // delete the item in the supabase database
  const { data: deletedItem, error } = await supabase
    .from("shopping_list")
    .delete()
    .eq("id", id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(204).send(`Item with id ${id} deleted`);
});

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
