# System requirements:
# * OS: *nix
# * zip
#
# Steps:
# * Adjust $filename variable to fit your needs.
# * Run this script, and the packed files are created in the ../dist directory.
#
#
filename="ptt-web-enhanced"
dir=$(dirname $(realpath "$0"))
src=$(realpath "$dir/../src")
dist=$(realpath "$dir/../dist")
cd "$src"

# Firefox addon
fn="$filename.xpi" &&
rm "$dist/$fn" &&
zip -r "$dist/$fn" * -x '.git*'
