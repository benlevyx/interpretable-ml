#!/bin/sh

rsync -avz  -e ssh * zm003@labinthewild.org:~/aliens.labinthewild.org/aliens/
rsync -avz -e ssh ../utils zm003@labinthewild.org:~/aliens.labinthewild.org/
