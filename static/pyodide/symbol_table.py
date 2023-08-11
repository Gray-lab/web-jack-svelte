
from typing import Iterable


class SymbolTable:
    """
    Holds either class-level or subroutine-level symbols
    """
    def __init__ (self) -> None:
        self.table = dict()
        self.var_counts = dict()

    def reset(self) -> None:
        """
        Resets the symbol table
        """
        self.table = dict()
        self.var_counts = dict()

    def define(self, var_name: str, var_type: str, var_kind: str) -> None:
        """
        Adds to the symbol table a new variable based on var_kind, var_type, and var_name.
        Sets the index to var_count and increments var_count by calling it
        """
        self.table[var_name] = {"var_type": var_type, 
                                "var_kind": var_kind, 
                                "var_index": self.var_count(var_kind)}

    def var_count(self, var_kind: str) -> int:
        """
        Returns the number of variable of a given kind already in the table and increments
        """
        count = self.var_counts.get(var_kind, 0)
        self.var_counts[var_kind] = self.var_counts.get(var_kind, 0) + 1
        return count

    def kind_of(self, var_name: str) -> str:
        """
        Returns the kind of the named identifier if it exists, or None if it doesn't. 
        """
        if var_name not in self.table:
            return None
        else:
            return self.table[var_name]["var_kind"]

    def type_of(self, var_name: str) -> str:
        """
        Returns the type of the named variable, or None. 
        Can only be called if the variable exists in the table.
        """
        return self.table[var_name]["var_type"]

    def index_of(self, var_name: str) -> int:
        """
        Returns the index of the named variable. 
        Can only be called if the variable exists in the table.
        """
        return self.table[var_name]["var_index"]

    def __iter__ (self) -> Iterable:
            yield from self.table.keys()

    def __str__(self) -> str:
        string = ""
        for key in self.table.keys():
            line = f"name:{key}, type:{self.type_of(key)}, kind:{self.kind_of(key)}, index:{self.index_of(key)}\n"
            string += line
        return string