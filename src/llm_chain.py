import os
from dotenv import load_dotenv
import pandas as pd
from sentence_transformers import SentenceTransformer
import faiss
import streamlit as st

# Load environment variables
load_dotenv()

# Load and vectorize CSV data
def load_and_vectorize_data(file_path):
    df = pd.read_csv(file_path)
    df['content'] = df.apply(lambda row: f"{row['work_year']} {row['experience_level']} {row['employment_type']} {row['job_title']} {row['salary']} {row['salary_currency']} {row['salary_in_usd']} {row['employee_residence']} {row['remote_ratio']} {row['company_location']} {row['company_size']}", axis=1)
    
    # Load embeddings model
    model = SentenceTransformer('all-MiniLM-L6-v2')
    embeddings = model.encode(df['content'].tolist())
    
    # Create FAISS index
    index = faiss.IndexFlatL2(embeddings.shape[1])
    index.add(embeddings)
    
    return index, df, model

# Function for similarity search
def similarity_search(index, query_embedding, df, k=5):
    distances, indices = index.search(query_embedding, k)
    return df.iloc[indices[0]].to_dict(orient='records')

# Function to process queries and analyze data
def analyze_query(query, df, model, index):
    if "average salary" in query:
        year = None
        if "year" in query:
            year = int(query.split()[-1])
        if year:
            year_data = df[df['work_year'] == year]
            avg_salary = year_data['salary_in_usd'].mean()
            return f"The average salary in {year} is {avg_salary:.2f} USD."
        else:
            avg_salary = df['salary_in_usd'].mean()
            return f"The overall average salary is {avg_salary:.2f} USD."
    elif "increase in Data Engineer job" in query:
        start_year = 2020
        end_year = 2024
        job_title = "Data Engineer"
        start_count = len(df[(df['work_year'] == start_year) & (df['job_title'] == job_title)])
        end_count = len(df[(df['work_year'] == end_year) & (df['job_title'] == job_title)])
        increase = end_count - start_count
        return f"The increase in Data Engineer jobs from {start_year} to {end_year} is {increase}."
    else:
        query_embedding = model.encode([query])
        results = similarity_search(index, query_embedding, df)
        return results

# Build the Streamlit app
def main():
    st.title("Salaries Data Insights Chatbot")
    
    query = st.text_input("Enter your query:")
    
    if st.button("Generate Response"):
        file_path = 'salaries.csv'
        index, df, model = load_and_vectorize_data(file_path)
        
        response = analyze_query(query.lower(), df, model, index)
        
        st.write("Response:")
        st.write(response)

if __name__ == "__main__":
    main()
