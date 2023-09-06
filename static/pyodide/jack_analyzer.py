
from compilation_engine import CompilationEngine

def compile_main(jack_file: str) -> str:
    try:
        compiler = CompilationEngine(jack_file)
        res = compiler.compile()
        return res
        
    except Exception as e:
        return f"Error: {e}"
