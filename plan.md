npm i --save-dev @types/express

supabase


npm install @supabase/supabase-js

npm install express @supabase/supabase-js dotenv



Supabase side Menubar 
API Docs 

Initializing
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://gwridwupyaqcbowtbrwj.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)
