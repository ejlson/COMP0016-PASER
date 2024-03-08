from chat import Chatbot
from embeddings import EmbeddingsChromaDB


if __name__ == "__main__":
    embeddings = EmbeddingsChromaDB()
    # embeddings.save_db_to_disk("../Reports")


    
    #embeddings.add_docs_to_db(["Annual_Report_2015.pdf"])

    chatbot = Chatbot(embeddings)

    chatbot.query("Who is in the Senior management team in the UN in 2016?")

    while True:
        query = input("YOU: ")
        print("CHATBOT: ")
        print(chatbot.query(query))
