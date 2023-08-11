BINARY_OP_DICT = {  "*": "call Math.multiply 2\n", 
                    "/": "call Math.divide 2\n",
                    "+": "add\n",
                    "-": "sub\n",
                    "&": "and\n",
                    "|": "or\n",
                    "=": "eq\n",
                    "<": "lt\n",
                    ">": "gt\n",}

UNARY_OP_DICT = {   "~": "not\n",
                    "-": "neg\n",}

def push(segment: str, value: int, comment: str ="") -> str:
    if comment:
        comment = "//" + comment
    return f"push {segment} {value} {comment}\n"

def pop(segment: str, value: int, comment: str ="") -> str:
    if comment:
        comment = "//" + comment
    return f"pop {segment} {value} {comment}\n"

def binary_arithmetic(operation: str) -> str:
    if operation in BINARY_OP_DICT:
        return BINARY_OP_DICT.get(operation)
    print(f"Arithmetic operation {operation} not found in BINARY_OP_DICT")
    return f"{operation}\n"

def unary_arithmetic(operation: str) -> str:
    if operation in UNARY_OP_DICT:
        return UNARY_OP_DICT.get(operation)
    print(f"Arithmetic operation {operation} not found in BINARY_OP_DICT")
    return f"{operation}\n"

def label(label: str) -> str:
    return f"label {label}\n"

def goto(label: str) -> str:
    return f"goto {label}\n"

def if_goto(label: str) -> str:
    return f"if-goto {label}\n"

def call(name: str, n_args: int) -> str:
    return f"call {name} {n_args}\n"

def function(name: str, n_vars: int) -> str:
    return f"function {name} {n_vars}\n"

def return_statement() -> str:
        return "return\n"

    
