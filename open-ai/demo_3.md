# Open AI demo 3

Show the different features for an assistant : https://platform.openai.com/assistants

Demo

1. File search - https://platform.openai.com/assistants/edit?assistant=asst_cfVqLzsrs2qJTfyNAcdltvUg

Document = Use training_planning_v2.pdf

Prompt = What is the planning of the training

2. Code interpreter - https://platform.openai.com/assistants/edit?assistant=asst_shoeiQVYV2zQSpWSV7J1nq1o

Prompt = Create a beautiful graph in python.

Activate / Deactivate code interpreter

3. Temperature and Top N - https://platform.openai.com/assistants/edit?assistant=asst_kxjtJKHu49QBcbdspEhSt83C

“Write a short story about a cat and a dog.”

Low Temperature (T = 0.2 / Top N = 1):
The assistant will generate a straightforward, predictable, and logical story—often using familiar phrases and common story structures.

High Temperature with default Top N (T = 1.9 / Top N = 1):
The assistant’s will go totally random with words from other languages.

High Temperature with slightly larger Top N (T = 1.9 / Top N = 1.5):
The assistant’s response will be much more creative, varied, and surprising, possibly introducing unexpected plot twists or quirky details.