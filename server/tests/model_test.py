from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.chat_models import ChatOpenAI

llm = ChatOpenAI(
    openai_api_base="http://localhost:1234/v1",
    openai_api_key="lmstudio", 
    model_name="microsoft/phi-4-mini-reasoning",  
    temperature=0.7
)

prompt = PromptTemplate.from_template("¿Cuál es la capital de {pais}?")
chain = prompt | llm

respuesta = chain.invoke("Paraguay")
print(respuesta)