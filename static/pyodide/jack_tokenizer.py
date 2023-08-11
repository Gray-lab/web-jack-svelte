import re
import string
import queue
from typing import Generator
from jack_token import Token

KEYWORDS = set(['class', 'constructor', 'function', 'method', 'field', 'static',
               'var', 'int', 'char', 'boolean', 'void', 'true', 'false', 'null',
                'this', 'let', 'do', 'if', 'else', 'while', 'return'])
SYMBOLS = set(['{', '}', '(', ')', '[', ']', '.', ',', ';', '+',
              '-', '*', '/', '&', '|', '<', '>', '=', '~'])
DIGITS = set(list(string.digits))
IDENTIFIER_START = set(list(string.ascii_letters)).union(set(['_']))
IDENTIFIER_BODY = IDENTIFIER_START.union(DIGITS)

# Integers: Only token that begins with a digit. In the range 0 ... 32767
# String constant: any sequence of characters except /n and " enclosed in ""
# Identifier: any sequence of letters, digits and _ not starting with a digit
# Comments and whitespace are ignored.
# Line comment: //
# Block comment: /* ... */
# API documentation comment (basically same as block comment): /** ... */

def string_tokenizer(input_string: str) -> Generator:
    """
    Returns a generator which yields Tokens from the source code
    """
    cleaned_text = remove_comments_and_whitespace(input_string)
    return get_token_generator(cleaned_text)

def remove_comments_and_whitespace(input_string: str) -> queue.SimpleQueue:
    """
    Removes line comments, empty rows, and newlines from each row, appending them to one another
    Returns a deque of individual characters
    """
    # Remove line comments and white space
    split = input_string.splitlines()
    valid_lines = (line.partition("//")[0].strip() for line in split)
    # Remove empty rows
    valid_lines = (line for line in valid_lines if line)
    source = ""
    for line in valid_lines:
        # Remove newline and append row
        source += line.strip('\n')
    # Remove block comments from the source string
    # Adapted from https://leetcode.com/problems/remove-comments/discuss/109195/1-liners
    clean_source = queue.SimpleQueue()
    res = filter(None, re.sub('/\*(.|\n)*?\*/', '', source))
    # string_res = "".join(res)
    # print(string_res)
    for ch in res:
        # Cleaned text is directly placed into a queue
        clean_source.put(ch)
    return clean_source

def get_token_generator(text: queue.SimpleQueue) -> Generator:
    """
    Generator which yields tokens of the form (label, token)
    while the text is not empty
    """
    consume_flag = False
    ch = text.get()
    while not text.empty():
        # If looping from a keyword, identifier, or literal don't consume another character
        if consume_flag:
            ch = text.get()
        else:
            consume_flag = True

        if ch == " ":
            continue

        elif ch in SYMBOLS:
            yield Token('symbol', ch)

        elif ch in DIGITS:
            int_lit = ""
            while ch in DIGITS:
                int_lit += ch
                ch = text.get()
            consume_flag = False
            yield Token("integerConstant", int_lit)

        elif ch in IDENTIFIER_START:
            word = ""
            while ch in IDENTIFIER_BODY:
                word += ch
                ch = text.get()
            consume_flag = False
            if word in KEYWORDS:
                yield Token("keyword", word)
            else:
                yield Token("identifier", word)

        elif ch == '"':
            ch = text.get()
            string_lit = ""
            while ch != '"':
                string_lit += ch
                ch = text.get()
            yield Token("stringConstant", string_lit)

        else:
            print("something broke with character", ch)
