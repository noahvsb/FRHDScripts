from fb_gen import Form, arrangement_to_frhd_string, get_coordinates, coordinate_equal, get_direction
import re
from sys import argv as arguments
import pyperclip


def create_arrangment(starting_direction: bool, order: str) -> list[Form]:
    arrangement = [Form((0, 0, 0), 0, True)]
    direction = 0 if starting_direction else 3

    i = 0
    for c in order:
        coordinates = get_coordinates(arrangement[i].coordinates, direction)

        rotation = get_rotation(direction, c)

        can_sc = c == 's'
        if can_sc and any(coordinate_equal(coordinates, form.coordinates) and form.can_sc for form in arrangement):
            can_sc = False

        arrangement.append(Form(coordinates, rotation, can_sc))

        direction = get_direction(direction, rotation)

        i += 1

    return arrangement


def get_rotation(prev_direction: int, c: str):
    if c == 's':
        return 0 if prev_direction % 3 == 0 else 1 if prev_direction % 3 == 1 else 2
    if c == 'l':
        return 2 if prev_direction % 3 == 0 else 0 if prev_direction % 3 == 1 else 1
    return 1 if prev_direction % 3 == 0 else 2 if prev_direction % 3 == 1 else 0


if __name__ == "__main__":
    if len(arguments) == 3 and arguments[1][0].lower() in ('u', 'd'):
        filtered_order = re.sub(r'[^lrs]', '', arguments[2].lower())
        arrangment = create_arrangment(arguments[1][0].lower() == 'u', filtered_order)
        frhd_string = arrangement_to_frhd_string(arrangment)
        pyperclip.copy(frhd_string)
        print(f'{frhd_string}\n\nCopied to clipboard!')
    else:
        print('Syntax: python fb_gen3.py [starting_direction u(p)|d(own)] [order [s|l|r]]')
