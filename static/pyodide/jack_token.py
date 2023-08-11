class Token:
    def __init__(self, label, value):
        self.label = label
        self.value = value

    def __eq__(self, other):
        if isinstance(other, Token):
            return self.value == other.value and self.label == other.label
        return False

    def __str__(self) -> str:
        """
        Represents Tokens in XML format as: <label> value </label>
        Replaces invalid XML characters (<, >, ", &) with alteratives.
        """
        value = self.value
        if self.value == '<':
            value = '&lt;'
        if self.value == '>':
            value = '&gt;'
        if self.value == '"':
            value = '&quot;'
        if self.value == '&':
            value = '&amp;'
        return f"\t<{self.label}> {value} </{self.label}>\n"