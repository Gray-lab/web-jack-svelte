
# Step 1: parse every element except Expressions and array Statements
# Step 2: handle Expressions
# Step 3: handle Array oriented statements (whileStatement)

# Base case will be a terminal
# If non-terminal, keep recursing until a terminal is reached

from jack_tokenizer import string_tokenizer
import vm_writer
from symbol_table import SymbolTable

KC = set(['true', 'false', 'null', 'this'])
OP = set(['+', '-', '*', '/', '&', '|', '<', '>', '='])
UOP = set(['-', '~'])

class CompilationEngine:
    """
    LL(2) parser. Frankly, we usually just need LL(1), but might as well make it LL(2) to deal with
    the few cases where we need that second token.
    """
    def __init__(self, in_string: str):
        # creates the token generator from a string input
        self.token_gen = string_tokenizer(in_string)
        self.current_token = None
        self.next_token = None
        
        # Initialize the symbol tables
        self.class_table = SymbolTable()
        self.subroutine_table = SymbolTable()

        # Load the first two tokens
        try:
            self.get_next_token()
            self.get_next_token()   
        except StopIteration as e:
            raise e

        # Initialize symbol state variables
        self.current_class = None
        self.current_subroutine = None
        self.current_subroutine_kind = None
        self.current_subroutine_type = None
        self.symbol_name = None
        self.symbol_type = None     # int | bool | char | className
        self.symbol_kind = None     # static or field for class variables, var or arg for subroutine
        self.symbol_category = None # field | static | var | arg | class | subroutine
        self.if_label_counter = 0
        self.while_label_counter = 0
        self.num_fields = 0
        self.result = ""

    def compile(self) -> str:
        try:
            self.compile_file()
            return self.result
        except SyntaxError as e:
            raise e
        

    def get_next_token(self) -> None:
        """
        Loads the next token. Mutates the class state.
        """
        self.current_token = self.next_token
        # Grab the new token
        try:
            self.next_token = next(self.token_gen)
        except StopIteration:
            # if we run out of tokens we have reached the end of the file and 
            # compileClass will wrap up and return
            pass
        except Exception as e:
            raise e


    def consume_token(self, token_label, token_val=[]) -> None:
        """
        Process the current token. Raises a SyntaxError if token is not accepted.
        
        #===============================#
        # Naming: 
        # Xxx.jack is compiled to Xxx.vm
        # subroutine yyy in Xxx.jack is compiled into function Xxx.yyy

        #===============================#
        # Identifiers need to contain the following data:
        # name (value)
        # category (field|static|var|arg|class|subroutine)
        # index (only for field, static, var, arg variables - provided by symbol table)
        # usage (is it being declared(appears in static/field/var) or used(jack expression))
        # No need to track the class identifier, as it doesn't ever get called after the first time
        
        #===============================#
        # Memory Mapping
        # static vars: static 0, static 1,...
        # field vars: this 0, this 1,...
        # local vars: local 0, local 1, ...
        # argument var declared in function or constructor (not method): argument 0, argument 1,...
        # argument var declared in method: argument 1, argument 2,...   (arg 0 is the object?)
        # To align the virtual segment 'this' with object passed by the caller 
        # of a method, use VM commands: 'push argument 0', 'pop pointer 0'
        """

        is_valid = False
        # check that token label is correct

        if token_label == self.current_token.label:
            if not token_val:
                is_valid = True
            else:
                # check that current token value matches one of the valid values
                for val in token_val:
                    if val == self.current_token.value:
                        is_valid = True

        if is_valid:
            # if self.current_token.label == "identifier":
                # self.write_identifier_token()
            # else:
                # self.result += (str(self.current_token))
            self.get_next_token()
        else:
            # a Syntax error without explicit handling in pyodide just leaves the page hanging
            raise SyntaxError(f"\n\
                expected: <{token_label}> {token_val} </{token_label}>\n\
                received: <{self.current_token.label}> {self.current_token.value} </{self.current_token.label}>")


    def compile_type(self):
        """
        type (TY): 'int' | 'char' | 'boolean' | className
        """
        if self.current_token.label == 'keyword':
            self.consume_token("keyword", ["int", "char", "boolean"])
        else:
            self.consume_token("identifier", [])

    def compile_file(self):
        """
        We are going to allow multiple classes to exist in a file, so this will call
        compile_class until we are out of tokens
        """
        while self.current_token.label == 'keyword' and self.current_token.value == "class":
            self.compile_class()
            self.class_table.reset()
            # add newline after each class
            self.result += "\n"

    def compile_class(self): #set class name
        """
        class:'class' className '{' classVarDec* subroutineDec* '}'

        compileClass will always be the first function called. Since Jack requires that
        every file is a class, the class declaration is the root of the parse tree
        """
        self.consume_token("keyword", ["class"])

        #====Set class name====#
        self.current_class = self.current_token.value
        self.symbol_category = "class definition"
        self.symbol_usage = "declaration"
        #====Reset num_fields====#
        self.num_fields = 0

        self.consume_token("identifier", [])
        self.consume_token("symbol", ["{"])
        while self.current_token.value in ["static", "field"]:
            self.compile_class_var_dec()

        #=====Debugging print of class table====#
        # print("Class symbol table:")
        # print(self.class_table)

        while self.current_token.value in ["constructor", "function", "method"]:
            self.compile_subroutine()
        self.consume_token("symbol", ["}"])

        # print("Finished!")
        
    def compile_class_var_dec(self): #declare static or field variables
        """
        classVarDec (CVD):('static'|'field') type varName(',' varName)* ';'
        """       
        #====Get kind of variable (static or field)====#
        self.symbol_category = self.current_token.value
        if self.symbol_category == "static":
            self.symbol_kind = "static"
        if self.symbol_category == "field":
            self.num_fields += 1
            self.symbol_kind = "this" 
        self.consume_token("keyword", ["static", "field"])

        #====Get type of variable====#
        self.symbol_type = self.current_token.value
        self.compile_type()

        #====Add class variable to class symbol table====#
        self.symbol_name = self.current_token.value
        self.class_table.define(self.symbol_name, self.symbol_type, self.symbol_kind)
        self.consume_token("identifier", [])

        while self.current_token.value != ";":
            self.consume_token("symbol", [","])

            #====Add class variable to class symbol table====#
            self.symbol_name = self.current_token.value
            self.class_table.define(self.symbol_name, self.symbol_type, self.symbol_kind)

            if self.symbol_category == "field":
                self.num_fields += 1
            self.consume_token("identifier", [])

        self.consume_token("symbol", [";"])

    def compile_subroutine(self): #set subroutine name, if method: this->arg0
        """
        subroutineDec (SD):('constructor'|'function'|'method') ('void'|type) subroutineName '('parameterList')' subroutineBody
        """
        #====Reset subroutine table====#
        self.subroutine_table.reset()
        
        #====Get subroutine kind====#
        self.current_subroutine_kind = self.current_token.value

        self.consume_token("keyword", ["constructor", "function", "method"])

        #====Get subroutine type====#
        # Will be either "void, int, char, boolean, or className"
        self.current_subroutine_type = self.current_token.value

        if self.current_token.value == 'void':
            self.consume_token("keyword", ["void"])
        else:
            self.compile_type()
        
        #====Set subroutine name====#
        self.current_subroutine = self.current_token.value

        #====Add method object to subroutine symbol table if it is a method====#
        if self.current_subroutine_kind == "method":
            self.subroutine_table.define("this", self.current_subroutine_type, "argument")
        
        self.consume_token("identifier", [])
        self.consume_token("symbol", ["("])
        self.compile_parameter_list()
        self.consume_token("symbol", [")"])
        self.compile_subroutine_body()

        #=====Debugging print of subroutine table====#
        # print(f"Subroutine symbol table at subroutine:{self.current_class}.{self.current_subroutine}")
        # print(self.subroutine_table)

    def compile_parameter_list(self): #declare args
        """
        parameterList (PL): ((type varName)) (',' type varName)*)?
        """
        # End of parameter list is defined by a close paren
        if self.current_token.value != ')':
            #====Get symbol kind====#
            self.symbol_kind = "argument"
            self.symbol_category = "argument"

            #====Get symbol type====#
            self.symbol_type = self.current_token.value
            self.compile_type()

            #====Get symbol name and add to subroutine table====#
            self.symbol_name = self.current_token.value
            self.subroutine_table.define(self.symbol_name, self.symbol_type, self.symbol_kind)
            
            self.consume_token("identifier", [])
            while self.current_token.value != ')':
                self.consume_token("symbol", [","])

                #====Get symbol type====#
                self.symbol_type = self.current_token.value
                self.compile_type()

                #====Get symbol name and add to subroutine table====#
                self.symbol_name = self.current_token.value
                self.subroutine_table.define(self.symbol_name, self.symbol_type, self.symbol_kind)

                self.consume_token("identifier", [])

    def compile_subroutine_body(self): #no symbols
        """
        subroutineBody (SB):'{'varDec* statements'}'
        """
        self.consume_token("symbol", ["{"])

        num_vars = 0
        # Each variable declaration begins with "var". Intervening tokens will be consumed by compileVarDec
        while self.current_token.value == "var":
            num_vars += self.compile_var_dec()
            
        # Extra argument is only passed in on the call!
        # if self.current_subroutine_kind == "method":
        #     num_vars += 1

        ### Start writing subroutine VM code ###
        self.result += (vm_writer.function(f"{self.current_class}.{self.current_subroutine}", num_vars))
        if self.current_subroutine_kind == "method":
            self.result += (vm_writer.push("argument", 0))
            self.result += (vm_writer.pop("pointer", 0))
        if self.current_subroutine_kind == "constructor":
            self.result += (vm_writer.push("constant", self.num_fields))
            self.result += ("call Memory.alloc 1\n")
            self.result += (vm_writer.pop("pointer", 0))
            
        self.compile_statements()
        self.consume_token("symbol", ["}"])

    def compile_var_dec(self) -> int: 
        """
        varDec (VD):'var' type varName(',' varName)* ';'
        """
        #====Get symbol kind====#
        self.symbol_kind = "local"
        self.symbol_category = "var"
        self.consume_token("keyword", ["var"])

        #====Get symbol type====#
        self.symbol_type = self.current_token.value
        self.compile_type()

        #====Get symbol name and add to subroutine table====#
        self.symbol_name = self.current_token.value
        self.subroutine_table.define(self.symbol_name, self.symbol_type, self.symbol_kind)
        count = 1

        self.consume_token("identifier", [])
        while self.current_token.value != ";":
            self.consume_token("symbol", [","])

            #====Get symbol name and add to subroutine table====#
            self.symbol_name = self.current_token.value
            self.subroutine_table.define(self.symbol_name, self.symbol_type, self.symbol_kind)
            count += 1

            self.consume_token("identifier", [])
        self.consume_token("symbol", ";")
        return count

    def compile_statements(self): #no symbols
        """
        statements (SS): statement*
        statement (S): letStatement | ifStatement | whileStatement | doStatement | returnStatement
        """
        while self.current_token.value in ["let", "if", "while", "do", "return"]:
            if self.current_token.value == "let":
                self.compile_let()
            if self.current_token.value == "if":
                self.compile_if()
            if self.current_token.value == "while":
                self.compile_while()
            if self.current_token.value == "do":
                self.compile_do()
            if self.current_token.value == "return":
                self.compile_return()

    def compile_let(self): #call variables
        """
        letStatement (LS): 'let' varName ('['expression']')? '=' expression ';'
        """
        self.consume_token("keyword", ["let"])
        variable = self.current_token.value
        table = self.get_symbol_table(variable)  
        self.consume_token("identifier", [])
        if self.current_token.value == "[":       
            # Handle case of varName[expression] = expression;
            ### push arr ###                                                                           
            self.result += (vm_writer.push(table.kind_of(variable), table.index_of(variable)))

            self.consume_token("symbol", ["["])
            self.compile_expression()
            self.consume_token("symbol", ["]"])

            self.result += ("add\n")
            
            self.consume_token("symbol", ["="])
            self.compile_expression()
            self.consume_token("symbol", [";"])
            # Pop expression which will be bound to arr[exp], saving it to temp 0
            self.result += (vm_writer.pop("temp", 0))

            # Move value at temp 0 to mem address arr[exp]
            self.result += (vm_writer.pop("pointer", 1))
            self.result += (vm_writer.push("temp", 0))
            self.result += (vm_writer.pop("that", 0))
        
        else:
            # Handle case of varName = expression;
            self.consume_token("symbol", ["="])
            self.compile_expression()
            self.consume_token("symbol", [";"])
            # print(table)
            self.result += (vm_writer.pop(table.kind_of(variable), table.index_of(variable)))

    def compile_if(self): 
        """
        ifStatement (IS): 'if' '('expression')' '{'statements'}'('else' '{'statements'}')?
        """
        self.consume_token("keyword", ["if"])
        self.consume_token("symbol", ["("])
        self.compile_expression()
        self.consume_token("symbol", [")"])
        
        # Get labels
        label_val = self.get_if_label()
        label1 = f"IF_FALSE{label_val}"
        label2 = f"IF_TRUE{label_val}"
        
        # Invert the value of the evaluated expression
        self.result += ("not\n")
        # If if expression was false, this if_goto will be triggered
        self.result += (vm_writer.if_goto(label1))

        self.consume_token("symbol", ["{"])
        self.compile_statements()
        self.consume_token("symbol", ["}"])

        # Goto for skipping else statement
        self.result += (vm_writer.goto(label2))

        # Label for skipping if statement
        self.result += (vm_writer.label(label1))

        if self.current_token.value == "else":
            self.consume_token("keyword", ["else"])
            self.consume_token("symbol", ["{"])
            self.compile_statements()
            self.consume_token("symbol", ["}"])

        # Label for skipping else statement
        self.result += (vm_writer.label(label2))

    def compile_while(self): 
        """
        whileStatement (WS): 'while' '('expression')' '{'statements'}'
        """
        # Get labels
        label1 = self.get_while_label()
        label2 = self.get_while_label()

        self.result += (vm_writer.label(label1))

        self.consume_token("keyword", ["while"])
        self.consume_token("symbol", ["("])
        self.compile_expression()
        self.consume_token("symbol", [")"])

        self.result += ("not\n")
        self.result += (vm_writer.if_goto(label2))

        self.consume_token("symbol", ["{"])
        self.compile_statements()
        self.consume_token("symbol", ["}"])

        self.result += (vm_writer.goto(label1))
        self.result += (vm_writer.label(label2))

    def compile_do(self): 
        """
        doStatement (DS): 'do' subroutineCall ';'
        """
        self.consume_token("keyword", ["do"])
        self.compile_subroutine_call()
        self.consume_token("symbol", [";"])

        # When compiling do statements, the return value must be removed from the stack
        self.result += (vm_writer.pop("temp", "0"))

    def compile_return(self): 
        """
        returnStatement (RS): 'return' expression? ';'
        """
        self.consume_token("keyword", ["return"])
        if self.current_token.value != ";":
            self.compile_expression()
        self.consume_token("symbol", [";"])

        
        if self.current_subroutine_kind in ["method", "function"] and self.current_subroutine_type == "void":
            self.result += (vm_writer.push("constant", 0))

        # Two lines below are not needed because returning "this" takes care of pushing pointer 0
        # if self.current_subroutine_kind == "constructor":
        #     self.result += (vm_writer.push("pointer", 0))
        self.result += (vm_writer.return_statement())

    def compile_expression(self): #no symbols
        """
        expression (E): term (op term)*
        """
        self.compile_term()
        while self.current_token.value in OP:
            operator = self.current_token.value
            self.consume_token("symbol", OP)
            self.compile_term()

            # terms are compiled to vm code before operator is written
            self.result += (vm_writer.binary_arithmetic(operator))

    def compile_term(self):
        """
        term (TR): integerConstant|stringConstant|keywordConstant|varName|varName
                   '['expression']'|'('expression')'|(unaryOp term)|subroutineCall
        """
        # requires two term lookahead if the current token is an identifier
        # second term resoves the identifier into a
        # variable (second term = '.')
        # array element (second term = '[')
        # or a subroutineCall (second temr = '(')

        if self.current_token.label == "integerConstant":
            integer_constant = self.current_token.value
            self.result += (vm_writer.push("constant", integer_constant))
            self.consume_token("integerConstant", [])

        elif self.current_token.label == "stringConstant":
            string_constant = self.current_token.value
            self.result += (vm_writer.push("constant", len(string_constant)))
            self.result += (vm_writer.call("String.new", 1))
            for ch in string_constant:
                if ord(ch) < 32 or ord(ch) > 128:
                    raise SyntaxError("Invalid string character in string literal")
                self.result += (vm_writer.push("constant", ord(ch)))
                self.result += (vm_writer.call("String.appendChar", 2))
            
            # Push result to stack? -> no need, done by String.appendChar
            self.consume_token("stringConstant", [])

        elif self.current_token.value in KC:
            keyword = self.current_token.value
            # This should get factored out to the vm writer
            match keyword:
                case "true":
                    # Push -1 to stack
                    self.result += (vm_writer.push("constant", 1))
                    self.result += ("neg\n")
                case "this":
                    # Push pointer 0 to stack
                    self.result += (vm_writer.push("pointer", 0))
                case other:
                    # null | false
                    self.result += (vm_writer.push("constant", 0))
            self.consume_token("keyword", KC)

        elif self.current_token.value in UOP:
            unary_operator = self.current_token.value
            self.consume_token("symbol", UOP)
            self.compile_term()
            self.result += (vm_writer.unary_arithmetic(unary_operator))

        elif self.current_token.value == "(":
            self.consume_token("symbol", ["("])
            self.compile_expression()
            self.consume_token("symbol", [")"])

        # the next 3 cases require LL(2)
        elif self.current_token.label == "identifier":
            
            if self.next_token.value == "[":
                # Array
                # varname '['expression']'
                ### push arr ###
                arr = self.current_token.value
                table = self.get_symbol_table(arr)                                                                               
                self.result += (vm_writer.push(table.kind_of(arr), table.index_of(arr)))

                self.consume_token("identifier", [])
                self.consume_token("symbol", ["["])
                self.compile_expression()
                # value of [expression] is at top of stack now
                # add (adds arr + expression)
                self.result += ("add\n")
                # pop pointer 1
                self.result += (vm_writer.pop("pointer", 1))
                # push that 0
                self.result += (vm_writer.push("that", 0))

                self.consume_token("symbol", ["]"])
            
            elif self.next_token.value in ["(", "."]:
                # subroutineCall
                self.compile_subroutine_call()

            else:
                ### push variable to stack###
                var = self.current_token.value
                table = self.get_symbol_table(var)                                                                               
                self.result += (vm_writer.push(table.kind_of(var), table.index_of(var)))

                self.consume_token("identifier", [])

        else:
            self.result += ("Something broke in compileTerm main branch")

    def compile_subroutine_call(self): #call function or method
        """
        subroutineCall (SC): 
        method: subroutineName'('expressionList')'|
        method or constructor or function: (className|varName)'.'subroutineName'('expressionList')'
        """
        
        # This is also only a method
        if self.next_token.value == "(":
            object_name = "this"
            subroutine_name = self.current_token.value
            self.result += (vm_writer.push("pointer", 0))

            self.consume_token("identifier", [])
            self.consume_token("symbol", ["("])
            num_args = self.compile_expression_list()
            self.consume_token("symbol", [")"])

            # If method, we add one argument for the object
            num_args += 1
            # table = self.get_symbol_table(object_name) 
            # Push current object to stack
            # self.result += (vm_writer.push(table.kind_of(object_name), table.index_of(object_name)))
            self.result += (vm_writer.call(f"{self.current_class}.{subroutine_name}", num_args))

        elif self.next_token.value == ".":
            # We need to decide whether we are calling a method or a function/constructor
            # If the identifier is in the symbol tables then we know we are calling on
            # an object. Otherwise, it is a module call. 
            module_name = self.current_token.value
            method_flag = False
            if module_name in self.subroutine_table or module_name in self.class_table:
                method_flag = True
                object_name = module_name
    
            if method_flag:
                # Push object pointer to stack 
                table = self.get_symbol_table(object_name)   
                self.result += (vm_writer.push(table.kind_of(object_name), table.index_of(object_name)))

            self.consume_token("identifier", [])
            self.consume_token("symbol", ["."])
            subroutine_name = self.current_token.value
            self.consume_token("identifier", [])
            self.consume_token("symbol", ["("])
            num_args = self.compile_expression_list()
            self.consume_token("symbol", [")"])

            if method_flag:
                # If method, we add one argument for the object
                num_args += 1
                # And we push the object to the stack                                                                        
                self.result += (vm_writer.call(f"{table.type_of(object_name)}.{subroutine_name}", num_args))
            else:
                self.result += (vm_writer.call(f"{module_name}.{subroutine_name}", num_args))

        else:
            self.result += ("Something broke in compileSubroutineCall")

    def compile_expression_list(self) -> int:
        """
        expressionList (EL): (expression(',' expression)*)?
        Returns count of expressions
        """
        expression_count = 0

        # End of parameter list is defined by a close paren
        if self.current_token.value != ')':
            self.compile_expression()
            expression_count += 1
            while self.current_token.value != ')':
                self.consume_token("symbol", [","])
                self.compile_expression()
                expression_count += 1

        return expression_count

    def get_symbol_table(self, symbol: str) -> SymbolTable:
        if symbol in self.subroutine_table:
            return self.subroutine_table
        elif symbol in self.class_table:
            return self.class_table
        else:
            raise SyntaxError(f"Variable {symbol} not found at symbol table")

    def get_if_label(self) -> str:
        label_val = self.if_label_counter
        self.if_label_counter += 1
        return f"IF{label_val}"

    def get_while_label(self) -> str:
        label_val = self.while_label_counter
        self.while_label_counter += 1
        return f"WHILE{label_val}"