import streamlit as st

# Inject custom CSS for Discord theme
st.markdown("""
    <style>
    body {
        background-color: #36393f;
        color: #ffffff;
    }
    .stButton button {
        background-color: #7289da;
        color: white;
    }
    .stTextInput input, .stTextArea textarea, .stSelectbox select, .stMultiSelect select, .stNumberInput input, .stCheckbox input, .stRadio input, .stDateInput input, .stTimeInput input {
        background-color: #2c2f33;
        color: white;
        border: 1px solid #7289da;
    }
    .stDataFrame, .stTable {
        background-color: #2c2f33;
        color: white;
        border: 1px solid #7289da;
    }
    </style>
""", unsafe_allow_html=True)

# Your Streamlit app code
st.title("Salaries Data Insights Chatbot")

# Add more Streamlit components as needed
