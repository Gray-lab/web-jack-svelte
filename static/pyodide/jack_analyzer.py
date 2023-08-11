
from compilation_engine import CompilationEngine

def compile_main(jack_file: str) -> str:
    compiler = CompilationEngine(jack_file)
    return compiler.compile()
